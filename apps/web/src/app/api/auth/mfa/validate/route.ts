import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { authenticator } from 'otplib';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { generateTokens } from '@/lib/auth/jwt';
import { logger } from '@/lib/logger';

/**
 * MFA Validate API - Validate MFA code during login
 * Public endpoint (called after initial password verification)
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
const ValidateMFASchema = z.object({
  userId: z.string().uuid(),
  code: z.string().min(6).max(8), // 6 for TOTP, 8 for backup codes
  useBackupCode: z.boolean().default(false),
});

/**
 * POST /api/auth/mfa/validate
 * Validate MFA code during login process
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ValidateMFASchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    // Get user with MFA settings
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      include: {
        mfaSettings: true,
        tenant: { select: { id: true, name: true } },
        employee: { select: { id: true } },
      },
    });

    if (!user || !user.mfaSettings) {
      logger.warn({
        userId: validatedData.userId,
        ipAddress,
      }, 'MFA validation attempted for user without MFA');

      return NextResponse.json(
        { success: false, error: 'MFA not configured for this user' },
        { status: 400 }
      );
    }

    if (!user.mfaSettings.verifiedAt) {
      return NextResponse.json(
        { success: false, error: 'MFA not verified. Please complete setup first.' },
        { status: 400 }
      );
    }

    let isValid = false;
    let usedBackupCode = false;

    if (validatedData.useBackupCode) {
      // Validate backup code
      const backupCodes = (user.mfaSettings.backupCodes as string[]) || [];

      for (let i = 0; i < backupCodes.length; i++) {
        const match = await bcrypt.compare(validatedData.code, backupCodes[i]);
        if (match) {
          isValid = true;
          usedBackupCode = true;

          // Remove used backup code
          backupCodes.splice(i, 1);
          await prisma.userMFA.update({
            where: { id: user.mfaSettings.id },
            data: { backupCodes },
          });

          logger.info({
            userId: user.id,
            remainingCodes: backupCodes.length,
          }, 'Backup code used for MFA');

          break;
        }
      }
    } else {
      // Validate TOTP code
      if (!user.mfaSettings.totpSecret) {
        return NextResponse.json(
          { success: false, error: 'TOTP not configured' },
          { status: 400 }
        );
      }

      const secret = decryptSecret(user.mfaSettings.totpSecret);
      isValid = authenticator.verify({
        token: validatedData.code,
        secret,
      });
    }

    if (!isValid) {
      logger.warn({
        userId: user.id,
        ipAddress,
        useBackupCode: validatedData.useBackupCode,
      }, 'Invalid MFA code during login');

      // Create audit log for failed attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'MFA_VALIDATION_FAILED',
          module: 'Authentication',
          details: `Invalid MFA code attempt${validatedData.useBackupCode ? ' (backup code)' : ''}`,
          ipAddress,
        },
      });

      return NextResponse.json(
        { success: false, error: 'Invalid MFA code' },
        { status: 401 }
      );
    }

    // MFA validation successful - generate tokens
    const { accessToken, refreshToken } = await generateTokens({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    });

    // Create session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress,
        device: request.headers.get('user-agent') || 'Unknown',
        status: 'Active',
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        module: 'Authentication',
        details: `Login successful with MFA${usedBackupCode ? ' (backup code used)' : ''}`,
        ipAddress,
      },
    });

    logger.info({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      sessionId: session.id,
      mfaMethod: usedBackupCode ? 'backup_code' : 'totp',
    }, 'Login successful with MFA');

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
          mfaEnabled: true,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error({ error }, 'Error validating MFA');

    return NextResponse.json(
      { success: false, error: 'Failed to validate MFA' },
      { status: 500 }
    );
  }
}
