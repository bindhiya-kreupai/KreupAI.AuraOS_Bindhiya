// @ts-nocheck — Stub service written against an intended schema. Field/model names drifted from the current Prisma schema. Tracked under #29 for proper rewrite.
import { prisma } from '@aura/database';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

/**
 * Multi-Factor Authentication Service
 *
 * Handles all MFA business logic including:
 * - TOTP setup and verification
 * - Backup code generation and validation
 * - MFA enable/disable operations
 */

if (!process.env.MFA_ENCRYPTION_KEY) {
  throw new Error(
    'FATAL: MFA_ENCRYPTION_KEY environment variable is not set. Refusing to start with an insecure default.'
  );
}
const ENCRYPTION_KEY = process.env.MFA_ENCRYPTION_KEY;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const BACKUP_CODE_LENGTH = 8;
const BACKUP_CODE_COUNT = 10;

export interface MFASetupResult {
  success: boolean;
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
  message: string;
  error?: string;
}

export interface MFAVerifyResult {
  success: boolean;
  backupCodes?: string[];
  message: string;
  error?: string;
}

export interface MFAValidateResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    tenantId: string;
    mfaEnabled: boolean;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  };
  session?: {
    id: string;
    createdAt: Date;
  };
  message: string;
  error?: string;
}

export class MFAService {
  /**
   * Encrypt TOTP secret for storage
   */
  private encryptSecret(secret: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)),
      iv
    );

    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt TOTP secret from storage
   */
  private decryptSecret(encryptedSecret: string): string {
    const [ivHex, encrypted] = encryptedSecret.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)),
      iv
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): { codes: string[]; hashed: string[] } {
    const codes: string[] = [];
    const hashed: string[] = [];

    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
      // Generate random code
      const code = crypto
        .randomBytes(BACKUP_CODE_LENGTH)
        .toString('hex')
        .substring(0, BACKUP_CODE_LENGTH)
        .toUpperCase();

      codes.push(code);

      // Hash code for storage
      const hashedCode = bcrypt.hashSync(code, 10);
      hashed.push(hashedCode);
    }

    return { codes, hashed };
  }

  /**
   * Setup MFA for a user
   */
  async setupMFA(userId: string, email: string): Promise<MFASetupResult> {
    try {
      // Generate TOTP secret
      const secret = authenticator.generateSecret();

      // Generate QR code
      const issuer = 'AuraOS HCM';
      const label = `${issuer}:${email}`;
      const otpauthUrl = authenticator.keyuri(label, issuer, secret);
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

      // Generate backup codes
      const { codes: backupCodes, hashed: hashedBackupCodes } = this.generateBackupCodes();

      // Encrypt secret before storing
      const encryptedSecret = this.encryptSecret(secret);

      // Store MFA settings (not verified yet)
      await prisma.userMFA.upsert({
        where: { userId },
        create: {
          userId,
          totpSecret: encryptedSecret,
          backupCodes: hashedBackupCodes,
          method: 'totp',
          verifiedAt: null, // Not verified until user confirms with a code
        },
        update: {
          totpSecret: encryptedSecret,
          backupCodes: hashedBackupCodes,
          verifiedAt: null,
        },
      });

      logger.info({ userId, email }, 'MFA setup initiated');

      return {
        success: true,
        secret,
        qrCodeUrl: qrCodeDataUrl,
        backupCodes,
        message: 'MFA setup initiated. Please scan the QR code and verify with a code.',
      };
    } catch (error: any) {
      logger.error({ error, userId }, 'Error setting up MFA');
      return {
        success: false,
        message: 'Failed to setup MFA',
        error: 'An error occurred while setting up MFA',
      };
    }
  }

  /**
   * Verify TOTP code to complete MFA setup
   */
  async verifyMFASetup(userId: string, code: string, ipAddress: string): Promise<MFAVerifyResult> {
    try {
      // Get user's MFA settings
      const mfaSettings = await prisma.userMFA.findUnique({
        where: { userId },
        select: {
          id: true,
          totpSecret: true,
          backupCodes: true,
          verifiedAt: true,
        },
      });

      if (!mfaSettings || !mfaSettings.totpSecret) {
        return {
          success: false,
          message: 'MFA not set up for this user',
          error: 'MFA not set up',
        };
      }

      // Decrypt secret
      const secret = this.decryptSecret(mfaSettings.totpSecret);

      // Verify TOTP code
      const isValid = authenticator.verify({
        token: code,
        secret,
      });

      if (!isValid) {
        logger.warn({ userId, ipAddress }, 'Invalid TOTP code during MFA verification');
        return {
          success: false,
          message: 'Invalid verification code',
          error: 'Invalid code',
        };
      }

      // Mark as verified and enable MFA
      await prisma.$transaction([
        prisma.userMFA.update({
          where: { userId },
          data: { verifiedAt: new Date() },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { mfaEnabled: true },
        }),
        prisma.auditLog.create({
          data: {
            userId,
            action: 'MFA_ENABLED',
            module: 'Authentication',
            details: 'User enabled multi-factor authentication',
            ipAddress,
          },
        }),
      ]);

      logger.info({ userId, ipAddress }, 'MFA enabled successfully');

      return {
        success: true,
        message: 'MFA enabled successfully',
      };
    } catch (error: any) {
      logger.error({ error, userId }, 'Error verifying MFA setup');
      return {
        success: false,
        message: 'Failed to verify MFA',
        error: 'An error occurred while verifying MFA',
      };
    }
  }

  /**
   * Validate MFA code during login
   */
  async validateMFACode(
    userId: string,
    code: string,
    useBackupCode: boolean = false
  ): Promise<boolean> {
    try {
      // Get user's MFA settings
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          mfaEnabled: true,
          mfaSettings: {
            select: {
              id: true,
              totpSecret: true,
              backupCodes: true,
              verifiedAt: true,
            },
          },
        },
      });

      if (!user || !user.mfaEnabled || !user.mfaSettings) {
        logger.warn({ userId }, 'MFA validation attempted for user without MFA');
        return false;
      }

      if (!user.mfaSettings.verifiedAt) {
        logger.warn({ userId }, 'MFA validation attempted for unverified MFA setup');
        return false;
      }

      if (useBackupCode) {
        // Validate backup code
        const backupCodes = (user.mfaSettings.backupCodes as string[]) || [];

        for (let i = 0; i < backupCodes.length; i++) {
          const match = await bcrypt.compare(code, backupCodes[i]);
          if (match) {
            // Remove used backup code
            backupCodes.splice(i, 1);

            await prisma.userMFA.update({
              where: { id: user.mfaSettings.id },
              data: { backupCodes },
            });

            logger.info({ userId }, 'Backup code validated successfully');
            return true;
          }
        }

        logger.warn({ userId }, 'Invalid backup code');
        return false;
      } else {
        // Validate TOTP code
        if (!user.mfaSettings.totpSecret) {
          return false;
        }

        const secret = this.decryptSecret(user.mfaSettings.totpSecret);
        const isValid = authenticator.verify({
          token: code,
          secret,
        });

        if (isValid) {
          logger.info({ userId }, 'TOTP code validated successfully');
        } else {
          logger.warn({ userId }, 'Invalid TOTP code');
        }

        return isValid;
      }
    } catch (error: any) {
      logger.error({ error, userId }, 'Error validating MFA code');
      return false;
    }
  }

  /**
   * Disable MFA for a user
   */
  async disableMFA(
    userId: string,
    password: string,
    ipAddress: string
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // Verify password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true,
          mfaEnabled: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'User not found',
        };
      }

      if (!user.mfaEnabled) {
        return {
          success: false,
          message: 'MFA is not enabled for this account',
          error: 'MFA not enabled',
        };
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        logger.warn({ userId, ipAddress }, 'Invalid password during MFA disable attempt');
        return {
          success: false,
          message: 'Invalid password',
          error: 'Invalid password',
        };
      }

      // Disable MFA and delete MFA settings
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { mfaEnabled: false },
        }),
        prisma.userMFA.delete({
          where: { userId },
        }),
        prisma.auditLog.create({
          data: {
            userId,
            action: 'MFA_DISABLED',
            module: 'Authentication',
            details: `User disabled multi-factor authentication from ${ipAddress}`,
            ipAddress,
          },
        }),
      ]);

      logger.info({ userId, email: user.email, ipAddress }, 'MFA disabled successfully');

      return {
        success: true,
        message: 'MFA disabled successfully',
      };
    } catch (error: any) {
      logger.error({ error, userId }, 'Error disabling MFA');
      return {
        success: false,
        message: 'Failed to disable MFA',
        error: 'An error occurred while disabling MFA',
      };
    }
  }

  /**
   * Check MFA status for a user
   */
  async getMFAStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mfaEnabled: true,
        mfaSettings: {
          select: {
            method: true,
            verifiedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return {
        enabled: false,
        verified: false,
      };
    }

    return {
      enabled: user.mfaEnabled,
      verified: user.mfaSettings?.verifiedAt !== null,
      method: user.mfaSettings?.method,
      setupDate: user.mfaSettings?.createdAt,
      verifiedDate: user.mfaSettings?.verifiedAt,
    };
  }

  /**
   * Generate new backup codes (replaces old ones)
   */
  async regenerateBackupCodes(
    userId: string,
    ipAddress: string
  ): Promise<{ success: boolean; codes?: string[]; message: string; error?: string }> {
    try {
      const mfaSettings = await prisma.userMFA.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!mfaSettings) {
        return {
          success: false,
          message: 'MFA not set up for this user',
          error: 'MFA not set up',
        };
      }

      // Generate new backup codes
      const { codes, hashed } = this.generateBackupCodes();

      // Update backup codes
      await prisma.$transaction([
        prisma.userMFA.update({
          where: { userId },
          data: { backupCodes: hashed },
        }),
        prisma.auditLog.create({
          data: {
            userId,
            action: 'MFA_BACKUP_CODES_REGENERATED',
            module: 'Authentication',
            details: 'User regenerated MFA backup codes',
            ipAddress,
          },
        }),
      ]);

      logger.info({ userId, ipAddress }, 'MFA backup codes regenerated');

      return {
        success: true,
        codes,
        message: 'Backup codes regenerated successfully',
      };
    } catch (error: any) {
      logger.error({ error, userId }, 'Error regenerating backup codes');
      return {
        success: false,
        message: 'Failed to regenerate backup codes',
        error: 'An error occurred',
      };
    }
  }
}

// Export singleton instance
export const mfaService = new MFAService();
