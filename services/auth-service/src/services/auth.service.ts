/**
 * Authentication Service
 * Core business logic for authentication
 */

import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { TokenService } from './token.service';
import { config } from '../config';
import { logger } from '../utils/logger';

const tokenService = new TokenService();

interface LoginResult {
  requiresMFA?: boolean;
  tempToken?: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: any;
}

export class AuthService {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string, tenantId: string): Promise<LoginResult> {
    try {
      // Find user by email and tenant
      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          tenantId,
          status: 'Active',
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          tenant: true,
        },
      });

      if (!user) {
        logger.warn({ email, tenantId }, 'Login attempt with invalid email');
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn({ userId: user.id, email }, 'Login attempt with invalid password');
        throw new Error('Invalid credentials');
      }

      // Check if MFA is enabled
      const mfaSecret = await prisma.mFASecret.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (mfaSecret && mfaSecret.isEnabled) {
        // Generate temporary token for MFA verification
        const tempToken = await tokenService.generateTempToken(user.id, tenantId);

        logger.info({ userId: user.id }, 'MFA required for login');

        return {
          requiresMFA: true,
          tempToken,
          userId: user.id,
        };
      }

      // Generate tokens
      const { accessToken, refreshToken, expiresIn } = await tokenService.generateTokens(user);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
        },
      });

      // Audit log
      if (config.features.auditLogging) {
        await prisma.auditLog.create({
          data: {
            tenantId,
            userId: user.id,
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: user.id,
            metadata: {
              email,
              method: 'password',
            },
          },
        });
      }

      logger.info({ userId: user.id, email }, 'User logged in successfully');

      return {
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
      logger.error({ error, email, tenantId }, 'Login error');
      throw error;
    }
  }

  /**
   * Validate user credentials (for dual-write pattern)
   */
  async validateCredentials(email: string, password: string, tenantId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          tenantId,
          status: 'Active',
        },
      });

      if (!user) {
        return false;
      }

      return await bcrypt.compare(password, user.password);
    } catch (error) {
      logger.error({ error, email, tenantId }, 'Credential validation error');
      return false;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new Error('Invalid old password');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      // Audit log
      if (config.features.auditLogging) {
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.id,
            action: 'PASSWORD_CHANGED',
            entityType: 'User',
            entityId: user.id,
            metadata: {},
          },
        });
      }

      logger.info({ userId }, 'Password changed successfully');
    } catch (error) {
      logger.error({ error, userId }, 'Change password error');
      throw error;
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(email: string, tenantId: string): Promise<void> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          tenantId,
        },
      });

      if (!user) {
        // Don't reveal if user exists
        logger.warn({ email, tenantId }, 'Password reset requested for non-existent user');
        return;
      }

      // Generate reset token (would normally send email)
      const resetToken = await tokenService.generateResetToken(user.id);

      logger.info({ userId: user.id, email }, 'Password reset token generated');

      // In production, send email with reset token
      // For now, just log it (security note: remove in production)
      logger.debug({ resetToken }, 'Password reset token (REMOVE IN PRODUCTION)');

      // Audit log
      if (config.features.auditLogging) {
        await prisma.auditLog.create({
          data: {
            tenantId,
            userId: user.id,
            action: 'PASSWORD_RESET_REQUESTED',
            entityType: 'User',
            entityId: user.id,
            metadata: { email },
          },
        });
      }
    } catch (error) {
      logger.error({ error, email, tenantId }, 'Password reset error');
      throw error;
    }
  }
}
