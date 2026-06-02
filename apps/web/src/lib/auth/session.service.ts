/**
 * Session Management Service
 * Handles JWT session creation and validation
 */

import jwt from 'jsonwebtoken';
import { redis } from '@/lib/cache/redis';
import { logger } from '@/lib/logger';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is not set. Refusing to start with an insecure default.'
  );
}
const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days

export interface SessionData {
  userId: string;
  email: string;
  tenantId?: string;
  roles?: string[];
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Session Service
 */
export class SessionService {
  /**
   * Create session for user
   */
  async createSession(sessionData: SessionData): Promise<SessionTokens> {
    try {
      const now = Math.floor(Date.now() / 1000);

      // Create access token (short-lived)
      const accessToken = jwt.sign(
        {
          ...sessionData,
          iat: now,
          exp: now + SESSION_TTL,
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
        }
      );

      // Create refresh token (long-lived)
      const refreshTokenId = crypto.randomUUID();
      const refreshToken = jwt.sign(
        {
          userId: sessionData.userId,
          tokenId: refreshTokenId,
          iat: now,
          exp: now + REFRESH_TOKEN_TTL,
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
        }
      );

      // Store refresh token in Redis
      const refreshKey = `refresh:${refreshTokenId}`;
      await redis.set(
        refreshKey,
        {
          userId: sessionData.userId,
          email: sessionData.email,
          createdAt: new Date().toISOString(),
        },
        REFRESH_TOKEN_TTL
      );

      logger.info({ userId: sessionData.userId }, 'Session created');

      return {
        accessToken,
        refreshToken,
        expiresIn: SESSION_TTL,
      };
    } catch (error: any) {
      logger.error({ error, userId: sessionData.userId }, 'Error creating session');
      throw error;
    }
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<SessionData | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
      }) as SessionData & { iat: number; exp: number };

      return {
        userId: decoded.userId,
        email: decoded.email,
        tenantId: decoded.tenantId,
        roles: decoded.roles,
      };
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid access token');
      } else {
        logger.error({ error }, 'Error verifying access token');
      }
      return null;
    }
  }

  /**
   * Refresh session using refresh token
   */
  async refreshSession(refreshToken: string): Promise<SessionTokens | null> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET, {
        algorithms: ['HS256'],
      }) as { userId: string; tokenId: string; iat: number; exp: number };

      // Check if refresh token exists in Redis
      const refreshKey = `refresh:${decoded.tokenId}`;
      const storedData = await redis.get<{
        userId: string;
        email: string;
        createdAt: string;
      }>(refreshKey);

      if (!storedData) {
        logger.warn({ tokenId: decoded.tokenId }, 'Refresh token not found');
        return null;
      }

      if (storedData.userId !== decoded.userId) {
        logger.error({ tokenId: decoded.tokenId }, 'Refresh token userId mismatch');
        return null;
      }

      // Create new session
      const sessionData: SessionData = {
        userId: storedData.userId,
        email: storedData.email,
      };

      const tokens = await this.createSession(sessionData);

      // Delete old refresh token
      await redis.delete(refreshKey);

      logger.info({ userId: storedData.userId }, 'Session refreshed');

      return tokens;
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid refresh token');
      } else {
        logger.error({ error }, 'Error refreshing session');
      }
      return null;
    }
  }

  /**
   * Revoke session (logout)
   */
  async revokeSession(refreshToken: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET, {
        algorithms: ['HS256'],
      }) as { tokenId: string; userId: string };

      const refreshKey = `refresh:${decoded.tokenId}`;
      await redis.delete(refreshKey);

      logger.info({ userId: decoded.userId }, 'Session revoked');

      return true;
    } catch (error: any) {
      logger.error({ error }, 'Error revoking session');
      return false;
    }
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    try {
      // Get all refresh tokens for user
      const pattern = `refresh:*`;
      const keys = await redis.keys(pattern);

      for (const key of keys) {
        const data = await redis.get<{ userId: string }>(key);
        if (data && data.userId === userId) {
          await redis.delete(key);
        }
      }

      logger.info({ userId }, 'All user sessions revoked');
    } catch (error: any) {
      logger.error({ error, userId }, 'Error revoking all user sessions');
      throw error;
    }
  }
}

// Export singleton instance
export const sessionService = new SessionService();
