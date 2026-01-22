/**
 * CSRF Protection Middleware
 * Implements form-based CSRF protection for non-OAuth2 routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/cache/redis';
import { sessionService } from '@/lib/auth/session.service';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

const CSRF_TOKEN_PREFIX = 'csrf:';
const CSRF_TOKEN_EXPIRY = 3600; // 1 hour in seconds

export interface CSRFTokenData {
  userId: string;
  sessionId?: string;
  createdAt: number;
}

/**
 * Generate a CSRF token for a user session
 */
export async function generateCSRFToken(
  userId: string,
  sessionId?: string
): Promise<string> {
  try {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Store token data in Redis
    const tokenData: CSRFTokenData = {
      userId,
      sessionId,
      createdAt: Date.now(),
    };

    await redisClient.set(
      `${CSRF_TOKEN_PREFIX}${token}`,
      JSON.stringify(tokenData),
      CSRF_TOKEN_EXPIRY
    );

    logger.debug({ userId, sessionId }, 'CSRF token generated');

    return token;
  } catch (error) {
    logger.error({ error, userId }, 'Error generating CSRF token');
    throw error;
  }
}

/**
 * Verify a CSRF token
 * Note: Token is NOT consumed on verification (can be reused within expiry window)
 */
export async function verifyCSRFToken(
  token: string,
  userId: string
): Promise<boolean> {
  try {
    if (!token) {
      logger.warn({ userId }, 'No CSRF token provided');
      return false;
    }

    // Get token data from Redis
    const tokenDataStr = await redisClient.get(`${CSRF_TOKEN_PREFIX}${token}`);

    if (!tokenDataStr) {
      logger.warn({ userId, token: token.substring(0, 8) + '...' }, 'Invalid or expired CSRF token');
      return false;
    }

    const tokenData: CSRFTokenData = JSON.parse(tokenDataStr);

    // Verify token belongs to the user
    if (tokenData.userId !== userId) {
      logger.warn(
        {
          tokenUserId: tokenData.userId,
          requestUserId: userId,
        },
        'CSRF token user mismatch'
      );
      return false;
    }

    return true;
  } catch (error) {
    logger.error({ error, userId }, 'Error verifying CSRF token');
    return false;
  }
}

/**
 * Delete a CSRF token (for logout or explicit invalidation)
 */
export async function deleteCSRFToken(token: string): Promise<void> {
  try {
    await redisClient.delete(`${CSRF_TOKEN_PREFIX}${token}`);
    logger.debug({ token: token.substring(0, 8) + '...' }, 'CSRF token deleted');
  } catch (error) {
    logger.error({ error }, 'Error deleting CSRF token');
  }
}

/**
 * Delete all CSRF tokens for a user (for logout)
 */
export async function deleteUserCSRFTokens(userId: string): Promise<void> {
  try {
    const pattern = `${CSRF_TOKEN_PREFIX}*`;
    const keys = await redisClient.keys(pattern);

    for (const key of keys) {
      const tokenDataStr = await redisClient.get(key);
      if (tokenDataStr) {
        const tokenData: CSRFTokenData = JSON.parse(tokenDataStr);
        if (tokenData.userId === userId) {
          await redisClient.delete(key);
        }
      }
    }

    logger.info({ userId }, 'All CSRF tokens deleted for user');
  } catch (error) {
    logger.error({ error, userId }, 'Error deleting user CSRF tokens');
  }
}

/**
 * Middleware to validate CSRF tokens on state-changing requests
 *
 * @example
 * ```typescript
 * import { withCSRFProtection } from '@/lib/middleware/csrf.middleware';
 *
 * export const POST = withCSRFProtection(async (request, { user, csrfToken }) => {
 *   // CSRF validated, proceed with request
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withCSRFProtection<T = any>(
  handler: (
    request: NextRequest,
    context: {
      user: { userId: string; email: string; tenantId: string };
      csrfToken: string;
    }
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    const method = request.method;

    // Only check CSRF on state-changing methods
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      // For GET/HEAD/OPTIONS, just verify session
      const accessToken = request.cookies.get('accessToken')?.value;
      if (!accessToken) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E1001',
              message: 'Authentication required',
            },
          },
          { status: 401 }
        ) as NextResponse<T>;
      }

      const sessionData = await sessionService.verifyAccessToken(accessToken);
      if (!sessionData) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E1002',
              message: 'Invalid or expired session',
            },
          },
          { status: 401 }
        ) as NextResponse<T>;
      }

      return handler(request, { user: sessionData, csrfToken: '' });
    }

    // Verify session first
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E1001',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      ) as NextResponse<T>;
    }

    const sessionData = await sessionService.verifyAccessToken(accessToken);
    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E1002',
            message: 'Invalid or expired session',
          },
        },
        { status: 401 }
      ) as NextResponse<T>;
    }

    // Get CSRF token from header or body
    let csrfToken = request.headers.get('X-CSRF-Token') || '';

    // If not in header, try to get from body (for form submissions)
    if (!csrfToken && request.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await request.json();
        csrfToken = body._csrf || '';

        // Create a new request with the body for the handler
        // (since we already consumed the body)
        const newRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(body),
        });

        // Verify CSRF token
        const isValid = await verifyCSRFToken(csrfToken, sessionData.userId);

        if (!isValid) {
          logger.warn(
            {
              userId: sessionData.userId,
              method,
              path: request.nextUrl.pathname,
            },
            'CSRF token validation failed'
          );

          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E1004',
                message: 'CSRF token validation failed',
                details: 'Invalid or missing CSRF token',
              },
            },
            { status: 403 }
          ) as NextResponse<T>;
        }

        return handler(newRequest, { user: sessionData, csrfToken });
      } catch (error) {
        logger.error({ error }, 'Error parsing request body for CSRF validation');
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'Invalid request body',
            },
          },
          { status: 400 }
        ) as NextResponse<T>;
      }
    }

    // Verify CSRF token
    const isValid = await verifyCSRFToken(csrfToken, sessionData.userId);

    if (!isValid) {
      logger.warn(
        {
          userId: sessionData.userId,
          method,
          path: request.nextUrl.pathname,
        },
        'CSRF token validation failed'
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E1004',
            message: 'CSRF token validation failed',
            details: 'Invalid or missing CSRF token',
          },
        },
        { status: 403 }
      ) as NextResponse<T>;
    }

    return handler(request, { user: sessionData, csrfToken });
  };
}

/**
 * Generate CSRF token for a session
 * Call this on login or when starting a new session
 */
export async function getOrCreateCSRFToken(
  userId: string,
  sessionId?: string
): Promise<string> {
  return generateCSRFToken(userId, sessionId);
}
