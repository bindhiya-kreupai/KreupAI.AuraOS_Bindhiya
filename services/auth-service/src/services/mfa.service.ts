/**
 * Multi-Factor Authentication Service
 */

import speakeasy from 'speakeasy';
import { prisma } from '../lib/prisma';
import { TokenService } from './token.service';
import { redis } from '../lib/redis';
import { config } from '../config';
import { logger } from '../utils/logger';

const tokenService = new TokenService();

interface MFASetupResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface MFAVerifyResult {
  valid: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: any;
}

export class MFAService {
  /**
   * Setup MFA for a user
   */
  async setupMFA(userId: string): Promise<MFASetupResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `${config.mfa.issuer} (${user.email})`,
        length: 32,
      });

      // Generate QR code URL
      const qrCode = secret.otpauth_url || '';

      // Generate backup codes
      const backupCodes = this.generateBackupCodes(8);

      // Store MFA secret in database
      await prisma.mFASecret.upsert({
        where: { userId },
        create: {
          userId,
          secret: secret.base32,
          backupCodes,
          isEnabled: false,
        },
        update: {
          secret: secret.base32,
          backupCodes,
          isEnabled: false,
        },
      });

      logger.info({ userId }, 'MFA setup initiated');

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      logger.error({ error, userId }, 'MFA setup error');
      throw error;
    }
  }

  /**
   * Verify MFA token and complete login
   */
  async verifyMFA(userId: string, token: string, tempToken: string): Promise<MFAVerifyResult> {
    try {
      // Verify temp token
      const storedTempToken = await redis.get(`temp:${userId}`);
      if (!storedTempToken || storedTempToken !== tempToken) {
        logger.warn({ userId }, 'Invalid temporary token for MFA');
        return { valid: false };
      }

      // Get MFA secret
      const mfaSecret = await prisma.mFASecret.findUnique({
        where: { userId },
      });

      if (!mfaSecret || !mfaSecret.secret) {
        throw new Error('MFA not set up for this user');
      }

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: mfaSecret.secret,
        encoding: 'base32',
        token,
        window: 1, // Allow 1 step before/after for clock drift
      });

      if (!verified) {
        // Check if it's a backup code
        const backupCodes = (mfaSecret.backupCodes as unknown as string[]) || [];
        const backupCodeIndex = backupCodes.indexOf(token);
        if (backupCodeIndex === -1) {
          logger.warn({ userId }, 'Invalid MFA token');
          return { valid: false };
        }

        // Remove used backup code
        const updatedBackupCodes = [...backupCodes];
        updatedBackupCodes.splice(backupCodeIndex, 1);

        await prisma.mFASecret.update({
          where: { userId },
          data: {
            backupCodes: updatedBackupCodes,
          },
        });

        logger.info({ userId }, 'Backup code used for MFA');
      }

      // Enable MFA if not already enabled
      if (!mfaSecret.isEnabled) {
        await prisma.mFASecret.update({
          where: { userId },
          data: {
            isEnabled: true,
          },
        });
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate tokens
      const { accessToken, refreshToken, expiresIn } = await tokenService.generateTokens(user);
      // Update last login
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLogin: new Date(),
        },
      });

      // Audit log
      if (config.features.auditLogging) {
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.id,
            action: 'MFA_VERIFIED',
            entityType: 'User',
            entityId: user.id,
            metadata: {},
          },
        });
      }

      logger.info({ userId }, 'MFA verification successful');

      return {
        valid: true,
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.roles[0]?.role.name || 'user',
          tenantId: user.tenantId,
        },
      };
    } catch (error) {
      logger.error({ error, userId }, 'MFA verification error');
      throw error;
    }
  }

  /**
   * Disable MFA for a user
   */
  async disableMFA(userId: string): Promise<void> {
    try {
      await prisma.mFASecret.update({
        where: { userId },
        data: {
          isEnabled: false,
        },
      });

      // Audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user && config.features.auditLogging) {
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.id,
            action: 'MFA_DISABLED',
            entityType: 'User',
            entityId: user.id,
            metadata: {},
          },
        });
      }

      logger.info({ userId }, 'MFA disabled');
    } catch (error) {
      logger.error({ error, userId }, 'MFA disable error');
      throw error;
    }
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}
