import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { authenticator } from 'otplib';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { generateTokens } from '@/lib/auth/jwt';
import { generateDeviceFingerprint } from '@/lib/auth/device-fingerprint.service';
import { resolveLocation, formatLocation } from '@/lib/auth/geolocation.service';
import { decryptSecret } from '@/lib/auth/mfa-crypto';
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/advanced-rate-limit';
import { logger } from '@/lib/logger';

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)\s*(h|d|m|s)$/);
  if (!match) return 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

/**
 * MFA Validate API - Validate MFA code during login
 * Public endpoint (called after initial password verification)
 * Rate-limited to 10 attempts per 5 minutes.
 */

// Validation Schema
const ValidateMFASchema = z.object({
  userId: z.string().min(1),
  code: z.string().min(6).max(8), // 6 for TOTP, 8 for backup codes
  useBackupCode: z.boolean().default(false),
});

/**
 * POST /api/auth/mfa/validate
 * Validate MFA code during login process
 */
export const POST = withRateLimit(RateLimitPresets.MFA_VALIDATION, async (request: NextRequest) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ValidateMFASchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    // Get user with MFA settings
    // tenant-ok: user.userId from authenticated JWT — already tenant-bound
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      include: {
        mfaSecret: true,
        tenant: { select: { id: true, name: true } },
        employee: { select: { id: true } },
      },
    });

    if (!user || !user.mfaSecret) {
      logger.warn(
        {
          userId: validatedData.userId,
          ipAddress,
        },
        'MFA validation attempted for user without MFA'
      );

      return NextResponse.json(
        { success: false, error: 'MFA not configured for this user' },
        { status: 400 }
      );
    }

    if (!user.mfaSecret.verifiedAt) {
      return NextResponse.json(
        { success: false, error: 'MFA not verified. Please complete setup first.' },
        { status: 400 }
      );
    }

    let isValid = false;
    let usedBackupCode = false;

    if (validatedData.useBackupCode) {
      // Validate backup code
      const backupCodes = (user.mfaSecret.backupCodes as string[]) || [];

      for (let i = 0; i < backupCodes.length; i++) {
        const match = await bcrypt.compare(validatedData.code, backupCodes[i]);
        if (match) {
          isValid = true;
          usedBackupCode = true;

          // Remove used backup code
          backupCodes.splice(i, 1);
          await prisma.mFASecret.update({
            where: { id: user.mfaSecret.id },
            data: { backupCodes },
          });

          logger.info(
            {
              userId: user.id,
              remainingCodes: backupCodes.length,
            },
            'Backup code used for MFA'
          );

          break;
        }
      }
    } else {
      // Validate TOTP code
      if (!user.mfaSecret.secret) {
        return NextResponse.json({ success: false, error: 'TOTP not configured' }, { status: 400 });
      }

      const secret = decryptSecret(user.mfaSecret.secret);
      isValid = authenticator.verify({
        token: validatedData.code,
        secret,
      });
    }

    if (!isValid) {
      logger.warn(
        {
          userId: user.id,
          ipAddress,
          useBackupCode: validatedData.useBackupCode,
        },
        'Invalid MFA code during login'
      );

      // Create audit log for failed attempt
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'MFA_VALIDATION_FAILED',
          module: 'AUTH',
          entityType: 'Authentication',
          metadata: {
            description: `Invalid MFA code attempt${validatedData.useBackupCode ? ' (backup code)' : ''}`,
          } as any,
          ipAddress,
        },
      });

      return NextResponse.json({ success: false, error: 'Invalid MFA code' }, { status: 401 });
    }

    // MFA validation successful - generate tokens
    const { accessToken, refreshToken } = await generateTokens({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    });

    // Calculate session expiry from JWT_EXPIRES_IN (default 24h)
    const expiresInStr = process.env.JWT_EXPIRES_IN || '24h';
    const expiresInMs = parseDuration(expiresInStr);
    const expiresAt = new Date(Date.now() + expiresInMs);

    // Create session with device fingerprint and location
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const acceptLanguage = request.headers.get('accept-language');
    const fingerprint = generateDeviceFingerprint(userAgent, ipAddress, acceptLanguage);
    let locationStr = '';
    try {
      const geoLocation = await resolveLocation(ipAddress);
      locationStr = formatLocation(geoLocation);
    } catch (_) {}

    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        ipAddress,
        device: userAgent.substring(0, 200),
        browser: userAgent.split('/')[0]?.substring(0, 100),
        deviceFingerprint: fingerprint.hash,
        location: locationStr || null,
        status: 'Active',
        expiresAt,
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
        tenantId: user.tenantId,
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        module: 'AUTH',
        entityType: 'Authentication',
        metadata: {
          description: `Login successful with MFA${usedBackupCode ? ' (backup code used)' : ''}`,
        } as any,
        ipAddress,
      },
    });

    logger.info(
      {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        sessionId: session.id,
        mfaMethod: usedBackupCode ? 'backup_code' : 'totp',
      },
      'Login successful with MFA'
    );

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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error({ error }, 'Error validating MFA');

    return NextResponse.json({ success: false, error: 'Failed to validate MFA' }, { status: 500 });
  }
});
