/**
 * Password Reset Service
 * Handles password reset token generation, validation, and password updates
 */

import { prisma } from '@aura/database';
import { redis as redisClient } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface PasswordResetTokenData {
  userId: string;
  email: string;
  createdAt: number;
}

export interface PasswordResetRequest {
  email: string;
  tenantId?: string;
}

export interface PasswordResetVerification {
  token: string;
  newPassword: string;
}

export class PasswordResetService {
  private readonly TOKEN_EXPIRY = 3600; // 1 hour in seconds
  private readonly TOKEN_PREFIX = 'password_reset:';

  /**
   * Generate a password reset token for a user
   * Stores the token in Redis with 1-hour expiry
   */
  async generateResetToken(request: PasswordResetRequest): Promise<{
    token: string;
    expiresAt: Date;
  } | null> {
    try {
      const { email, tenantId } = request;

      // Find user by email
      const user = await prisma.user.findFirst({
        where: {
          email,
          ...(tenantId ? { tenantId } : {}),
        },
        select: {
          id: true,
          email: true,
          status: true,
        },
      });

      if (!user) {
        // Don't reveal if user exists or not (security best practice)
        logger.warn({ email }, 'Password reset requested for non-existent user');
        return null;
      }

      if (user.status !== 'Active') {
        logger.warn({ userId: user.id, status: user.status }, 'Password reset requested for inactive user');
        return null;
      }

      // Generate secure random token
      const token = crypto.randomBytes(32).toString('hex');

      // Store token data in Redis
      const tokenData: PasswordResetTokenData = {
        userId: user.id,
        email: user.email,
        createdAt: Date.now(),
      };

      await redisClient.set(
        `${this.TOKEN_PREFIX}${token}`,
        JSON.stringify(tokenData),
        this.TOKEN_EXPIRY
      );

      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY * 1000);

      logger.info({ userId: user.id, email: user.email }, 'Password reset token generated');

      return {
        token,
        expiresAt,
      };
    } catch (error: any) {
      logger.error({ error, email: request.email }, 'Error generating password reset token');
      throw error;
    }
  }

  /**
   * Verify a password reset token
   * Returns user data if token is valid, null otherwise
   */
  async verifyResetToken(token: string): Promise<PasswordResetTokenData | null> {
    try {
      // Get token data from Redis
      const tokenDataStr = await redisClient.get(`${this.TOKEN_PREFIX}${token}`);

      if (!tokenDataStr) {
        logger.warn({ token: token.substring(0, 8) + '...' }, 'Invalid or expired password reset token');
        return null;
      }

      const tokenData: PasswordResetTokenData = JSON.parse(tokenDataStr);

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: tokenData.userId },
        select: {
          id: true,
          status: true,
        },
      });

      if (!user || user.status !== 'Active') {
        logger.warn({ userId: tokenData.userId }, 'Password reset token for inactive user');
        // Delete the token
        await redisClient.delete(`${this.TOKEN_PREFIX}${token}`);
        return null;
      }

      return tokenData;
    } catch (error: any) {
      logger.error({ error }, 'Error verifying password reset token');
      return null;
    }
  }

  /**
   * Reset password using a valid token
   * One-time use: token is deleted after successful password reset
   */
  async resetPassword(verification: PasswordResetVerification): Promise<{
    success: boolean;
    userId?: string;
  }> {
    try {
      const { token, newPassword } = verification;

      // Verify token
      const tokenData = await this.verifyResetToken(token);

      if (!tokenData) {
        return { success: false };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      await prisma.user.update({
        where: { id: tokenData.userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      // Delete token (one-time use)
      await redisClient.delete(`${this.TOKEN_PREFIX}${token}`);

      // Invalidate all existing sessions for this user (security best practice)
      await this.invalidateUserSessions(tokenData.userId);

      logger.info(
        { userId: tokenData.userId, email: tokenData.email },
        'Password reset successful'
      );

      return {
        success: true,
        userId: tokenData.userId,
      };
    } catch (error: any) {
      logger.error({ error }, 'Error resetting password');
      throw error;
    }
  }

  /**
   * Invalidate all sessions for a user
   * Called after password reset for security
   */
  private async invalidateUserSessions(userId: string): Promise<void> {
    try {
      // Delete all refresh tokens for this user from Redis
      const pattern = `refresh:*`;
      const keys = await redisClient.keys(pattern);

      for (const key of keys) {
        const tokenDataStr = await redisClient.get(key);
        if (tokenDataStr) {
          const tokenData = JSON.parse(tokenDataStr);
          if (tokenData.userId === userId) {
            await redisClient.delete(key);
          }
        }
      }

      // Update UserSession table if you're using it
      await prisma.userSession.updateMany({
        where: {
          userId,
          status: 'Active',
        },
        data: {
          status: 'Expired',
        },
      });

      logger.info({ userId }, 'All user sessions invalidated after password reset');
    } catch (error: any) {
      logger.error({ error, userId }, 'Error invalidating user sessions');
      // Don't throw - password reset should still succeed
    }
  }

  /**
   * Check if a token is valid (without consuming it)
   * Useful for showing "Reset Password" form
   */
  async isTokenValid(token: string): Promise<boolean> {
    const tokenData = await this.verifyResetToken(token);
    return tokenData !== null;
  }

  /**
   * Cancel a password reset token
   * Useful if user decides not to reset password
   */
  async cancelResetToken(token: string): Promise<void> {
    try {
      await redisClient.delete(`${this.TOKEN_PREFIX}${token}`);
      logger.info({ token: token.substring(0, 8) + '...' }, 'Password reset token cancelled');
    } catch (error: any) {
      logger.error({ error }, 'Error cancelling password reset token');
    }
  }
}

// Export singleton instance
export const passwordResetService = new PasswordResetService();
