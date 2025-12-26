/**
 * Token Service
 * JWT token generation and validation
 */

import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { config } from '../config';
import { logger } from '../utils/logger';

interface TokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh' | 'temp' | 'reset';
}

interface TokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class TokenService {
  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: any): Promise<TokenResult> {
    const payload: Omit<TokenPayload, 'type'> = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role?.name || 'user',
    };

    // Generate access token
    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Generate refresh token
    const refreshTokenValue = randomBytes(32).toString('hex');
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh', jti: refreshTokenValue },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Parse expiry
    const expiresIn = this.parseExpiry(config.jwt.expiresIn);

    logger.debug({ userId: user.id }, 'Tokens generated');

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Generate temporary token for MFA
   */
  async generateTempToken(userId: string, tenantId: string): Promise<string> {
    const tempToken = jwt.sign(
      {
        userId,
        tenantId,
        type: 'temp',
      },
      config.jwt.secret,
      { expiresIn: '5m' } // 5 minutes
    );

    // Store in Redis with TTL
    await redis.setex(`temp:${userId}`, 300, tempToken); // 5 minutes

    logger.debug({ userId }, 'Temporary token generated');

    return tempToken;
  }

  /**
   * Generate password reset token
   */
  async generateResetToken(userId: string): Promise<string> {
    const resetToken = randomBytes(32).toString('hex');

    // Store in Redis with TTL
    await redis.setex(`reset:${userId}`, 3600, resetToken); // 1 hour

    logger.debug({ userId }, 'Reset token generated');

    return resetToken;
  }

  /**
   * Verify and decode token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      // Check if token is revoked
      const isRevoked = await redis.get(`revoked:${token}`);
      if (isRevoked) {
        throw new Error('Token has been revoked');
      }

      // Verify JWT
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          role: true,
        },
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        tenantId: user.tenantId,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn({ error: error.message }, 'Invalid token');
        throw new Error('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Token expired');
        throw new Error('Token expired');
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<Omit<TokenResult, 'refreshToken'>> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as TokenPayload & { jti: string };

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token: decoded.jti,
          userId: decoded.userId,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!storedToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          userId: decoded.userId,
          tenantId: decoded.tenantId,
          email: decoded.email,
          role: decoded.role,
          type: 'access',
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const expiresIn = this.parseExpiry(config.jwt.expiresIn);

      logger.debug({ userId: decoded.userId }, 'Access token refreshed');

      return {
        accessToken,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn({ error: error.message }, 'Invalid refresh token');
        throw new Error('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Refresh token expired');
        throw new Error('Refresh token expired');
      }
      throw error;
    }
  }

  /**
   * Revoke token (logout)
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as TokenPayload;

      if (!decoded) {
        return;
      }

      // Add token to revoked list in Redis
      const expiresIn = this.parseExpiry(config.jwt.expiresIn);
      await redis.setex(`revoked:${token}`, expiresIn, '1');

      logger.debug({ userId: decoded.userId }, 'Token revoked');
    } catch (error) {
      logger.error({ error }, 'Error revoking token');
    }
  }

  /**
   * Parse expiry string to seconds
   */
  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 3600; // 1 hour default
    }
  }
}
