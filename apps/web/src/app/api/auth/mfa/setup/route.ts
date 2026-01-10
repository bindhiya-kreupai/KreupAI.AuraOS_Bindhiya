import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { withEnhancedAuth } from '@/lib/auth/enhanced-middleware';
import { logger } from '@/lib/logger';

/**
 * MFA Setup API - Initialize TOTP-based Multi-Factor Authentication
 * Requires authentication
 */

const ENCRYPTION_KEY = process.env.MFA_ENCRYPTION_KEY || 'default-key-change-in-production';
const BACKUP_CODES_COUNT = 10;

/**
 * Simple encryption for TOTP secrets (use proper encryption in production)
 */
function encryptSecret(secret: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Generate backup codes
 */
function generateBackupCodes(): { codes: string[]; hashed: string[] } {
  const codes: string[] = [];
  const hashed: string[] = [];

  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
    hashed.push(bcrypt.hashSync(code, 10));
  }

  return { codes, hashed };
}

/**
 * POST /api/auth/mfa/setup
 * Generate TOTP secret and QR code for MFA setup
 */
export const POST = withEnhancedAuth(async (request: NextRequest, { user }) => {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    // Check if user already has MFA enabled
    const existingMFA = await prisma.userMFA.findUnique({
      where: { userId: user.userId },
    });

    if (existingMFA && existingMFA.verifiedAt) {
      logger.warn({
        userId: user.userId,
        ipAddress,
      }, 'MFA setup attempted for user with already verified MFA');

      return NextResponse.json(
        { success: false, error: 'MFA is already enabled for this account' },
        { status: 400 }
      );
    }

    // Generate TOTP secret
    const secret = authenticator.generateSecret();

    // Get user email for QR code label
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { email: true, tenant: { select: { name: true } } },
    });

    if (!userRecord) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate OTP auth URL
    const issuer = userRecord.tenant?.name || 'AuraOS';
    const label = userRecord.email;
    const otpauthUrl = authenticator.keyuri(label, issuer, secret);

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Generate backup codes
    const { codes: backupCodes, hashed: hashedBackupCodes } = generateBackupCodes();

    // Encrypt the secret before storing
    const encryptedSecret = encryptSecret(secret);

    // Store MFA settings (not yet verified)
    await prisma.userMFA.upsert({
      where: { userId: user.userId },
      create: {
        userId: user.userId,
        totpSecret: encryptedSecret,
        backupCodes: hashedBackupCodes,
        method: 'totp',
        verifiedAt: null, // Not verified yet
      },
      update: {
        totpSecret: encryptedSecret,
        backupCodes: hashedBackupCodes,
        verifiedAt: null, // Reset verification
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'MFA_SETUP_INITIATED',
        module: 'Authentication',
        details: 'MFA setup initiated - waiting for verification',
        ipAddress,
      },
    });

    logger.info({
      userId: user.userId,
      email: userRecord.email,
      ipAddress,
    }, 'MFA setup initiated');

    return NextResponse.json({
      success: true,
      data: {
        secret, // Return plain secret for manual entry
        qrCode: qrCodeDataUrl,
        backupCodes, // Return plain backup codes (save these!)
        issuer,
      },
      message: 'MFA setup initiated. Scan the QR code with your authenticator app and verify with a code.',
    });
  } catch (error) {
    logger.error({ error, userId: user.userId }, 'Error in MFA setup');

    return NextResponse.json(
      { success: false, error: 'Failed to setup MFA' },
      { status: 500 }
    );
  }
});

/**
 * GET /api/auth/mfa/setup
 * Check MFA status for current user
 */
export const GET = withEnhancedAuth(async (request: NextRequest, { user }) => {
  try {
    const mfaSettings = await prisma.userMFA.findUnique({
      where: { userId: user.userId },
      select: {
        method: true,
        verifiedAt: true,
        createdAt: true,
      },
    });

    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { mfaEnabled: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        mfaEnabled: userRecord?.mfaEnabled || false,
        mfaVerified: !!mfaSettings?.verifiedAt,
        method: mfaSettings?.method,
        setupDate: mfaSettings?.createdAt,
        verifiedDate: mfaSettings?.verifiedAt,
      },
    });
  } catch (error) {
    logger.error({ error, userId: user.userId }, 'Error checking MFA status');

    return NextResponse.json(
      { success: false, error: 'Failed to check MFA status' },
      { status: 500 }
    );
  }
});
