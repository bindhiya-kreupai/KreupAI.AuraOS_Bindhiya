import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { authenticator } from 'otplib';
import crypto from 'crypto';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth/enhanced-middleware';
import { logger } from '@/lib/logger';

/**
 * MFA Verify API - Verify TOTP code to complete MFA setup
 * Requires authentication
 */

const ENCRYPTION_KEY = process.env.MFA_ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Simple decryption for TOTP secrets
 */
function decryptSecret(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Validation Schema
const VerifyMFASchema = z.object({
  code: z.string().length(6, 'TOTP code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

/**
 * POST /api/auth/mfa/verify
 * Verify TOTP code to enable MFA
 */
export const POST = withEnhancedAuth(async (request: NextRequest, { user }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = VerifyMFASchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    // Get MFA settings
    const mfaSettings = await prisma.userMFA.findUnique({
      where: { userId: user.userId },
    });

    if (!mfaSettings) {
      return NextResponse.json(
        { success: false, error: 'MFA not set up. Please initiate setup first.' },
        { status: 400 }
      );
    }

    if (mfaSettings.verifiedAt) {
      return NextResponse.json(
        { success: false, error: 'MFA is already verified and enabled' },
        { status: 400 }
      );
    }

    if (!mfaSettings.totpSecret) {
      return NextResponse.json(
        { success: false, error: 'TOTP secret not found. Please restart setup.' },
        { status: 400 }
      );
    }

    // Decrypt secret
    const secret = decryptSecret(mfaSettings.totpSecret);

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: validatedData.code,
      secret,
    });

    if (!isValid) {
      logger.warn({
        userId: user.userId,
        ipAddress,
      }, 'Invalid MFA verification code attempt');

      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark MFA as verified and enable it on user account
    await prisma.$transaction([
      prisma.userMFA.update({
        where: { userId: user.userId },
        data: { verifiedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.userId },
        data: { mfaEnabled: true },
      }),
    ]);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'MFA_ENABLED',
        module: 'Authentication',
        details: 'MFA successfully verified and enabled',
        ipAddress,
      },
    });

    logger.info({
      userId: user.userId,
      ipAddress,
    }, 'MFA successfully enabled');

    return NextResponse.json({
      success: true,
      message: 'MFA successfully enabled. You will now be required to enter a code when logging in.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid code format', details: error.errors },
        { status: 400 }
      );
    }

    logger.error({ error, userId: user.userId }, 'Error verifying MFA');

    return NextResponse.json(
      { success: false, error: 'Failed to verify MFA' },
      { status: 500 }
    );
  }
});
