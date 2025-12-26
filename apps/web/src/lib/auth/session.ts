/**
 * Session Utilities
 *
 * Provides utilities for getting authenticated session from requests.
 * Ensures tenantId and userId are retrieved from JWT token, not query params.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { JWTPayload } from './jwt';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { logger } from '@/lib/logger';

/**
 * Session data extracted from authenticated request
 */
export interface Session {
  userId: string;
  email: string;
  tenantId: string;
  sessionId?: string;
  isAuthenticated: true;
}

/**
 * Result of session retrieval
 */
export type SessionResult =
  | { session: Session; error: null }
  | { session: null; error: { message: string; status: number } };

/**
 * Get session from request
 *
 * IMPORTANT: Always use this to get tenantId and userId instead of
 * reading from query parameters, which is insecure.
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const { session, error } = getSession(request);
 *   if (error) {
 *     return NextResponse.json({ error: error.message }, { status: error.status });
 *   }
 *
 *   // Now use session.tenantId and session.userId safely
 *   const data = await prisma.employee.findMany({
 *     where: { tenantId: session.tenantId }
 *   });
 * }
 * ```
 */
export function getSession(request: NextRequest): SessionResult {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        session: null,
        error: { message: 'Authentication required', status: 401 }
      };
    }

    const decoded = verifyToken(token);

    if (decoded.type !== 'access') {
      return {
        session: null,
        error: { message: 'Invalid token type', status: 401 }
      };
    }

    return {
      session: {
        userId: decoded.userId,
        email: decoded.email,
        tenantId: decoded.tenantId,
        sessionId: decoded.sessionId,
        isAuthenticated: true
      },
      error: null
    };
  } catch (error) {
    logger.warn({ error }, 'Failed to extract session from request');
    return {
      session: null,
      error: {
        message: error instanceof Error ? error.message : 'Invalid or expired token',
        status: 401
      }
    };
  }
}

/**
 * Get session or return error response
 *
 * Convenience function that returns NextResponse on error.
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const result = getSessionOrError(request);
 *   if (result instanceof NextResponse) {
 *     return result; // Return error response
 *   }
 *
 *   const session = result;
 *   // Use session.tenantId, session.userId
 * }
 * ```
 */
export function getSessionOrError(request: NextRequest): Session | NextResponse {
  const { session, error } = getSession(request);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status }
    );
  }

  return session;
}

/**
 * Require session middleware wrapper
 *
 * Wraps a handler function and ensures authentication.
 *
 * @example
 * ```typescript
 * export const GET = requireSession(async (request, session) => {
 *   const data = await prisma.employee.findMany({
 *     where: { tenantId: session.tenantId }
 *   });
 *   return NextResponse.json({ success: true, data });
 * });
 * ```
 */
export function requireSession<T>(
  handler: (request: NextRequest, session: Session) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | { success: false; error: string }>> => {
    const result = getSessionOrError(request);

    if (result instanceof NextResponse) {
      return result as NextResponse<{ success: false; error: string }>;
    }

    return handler(request, result);
  };
}

/**
 * Verify tenant access
 *
 * Ensures the authenticated user has access to the requested resource.
 *
 * @param session - Authenticated session
 * @param resourceTenantId - Tenant ID of the resource being accessed
 * @returns null if access is allowed, NextResponse if denied
 */
export function verifyTenantAccess(
  session: Session,
  resourceTenantId: string | null | undefined
): NextResponse | null {
  if (!resourceTenantId) {
    logger.warn({
      userId: session.userId,
      tenantId: session.tenantId
    }, 'Attempted to access resource without tenant ID');

    return NextResponse.json(
      { success: false, error: 'Resource has no tenant association' },
      { status: 400 }
    );
  }

  if (resourceTenantId !== session.tenantId) {
    logger.error({
      userId: session.userId,
      userTenantId: session.tenantId,
      resourceTenantId
    }, 'Tenant isolation violation attempt');

    return NextResponse.json(
      { success: false, error: 'Access denied' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Get optional session
 *
 * For endpoints that work with or without authentication.
 * Returns session if authenticated, null otherwise.
 */
export function getOptionalSession(request: NextRequest): Session | null {
  const { session } = getSession(request);
  return session;
}

/**
 * Extract user info from JWT payload
 */
export function extractUserInfo(payload: JWTPayload): Session {
  return {
    userId: payload.userId,
    email: payload.email,
    tenantId: payload.tenantId,
    sessionId: payload.sessionId,
    isAuthenticated: true
  };
}

export default {
  getSession,
  getSessionOrError,
  requireSession,
  verifyTenantAccess,
  getOptionalSession,
  extractUserInfo
};
