/**
 * Session Validation Middleware
 * Automatically validates JWT session tokens for protected routes
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { sessionService } from '@/lib/auth/session.service';
import { logger } from '@/lib/logger';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    tenantId: string;
  };
}

/**
 * Middleware to validate session tokens
 * Use this to protect API routes that require authentication
 */
export async function validateSession(
  request: NextRequest
): Promise<{ valid: boolean; user?: any; response?: NextResponse }> {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      logger.warn({ path: request.nextUrl.pathname }, 'No access token provided');
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              code: 'E1001',
              message: 'Authentication required',
              details: 'No access token provided',
            },
          },
          { status: 401 }
        ),
      };
    }

    // Verify token
    const sessionData = await sessionService.verifyAccessToken(accessToken);

    if (!sessionData) {
      logger.warn({ path: request.nextUrl.pathname }, 'Invalid or expired access token');
      return {
        valid: false,
        response: NextResponse.json(
          {
            success: false,
            error: {
              code: 'E1002',
              message: 'Invalid or expired session',
              details: 'Please log in again',
            },
          },
          { status: 401 }
        ),
      };
    }

    // Session is valid
    return {
      valid: true,
      user: sessionData,
    };
  } catch (error: any) {
    logger.error({ error, path: request.nextUrl.pathname }, 'Error validating session');
    return {
      valid: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Internal server error',
            details: 'Error validating session',
          },
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Higher-order function to wrap API route handlers with session validation
 *
 * @example
 * ```typescript
 * import { withSession } from '@/lib/middleware/session.middleware';
 *
 * export const GET = withSession(async (request, { user }) => {
 *   // user is automatically available here
 *   const { userId, email, tenantId } = user;
 *
 *   // Your API logic here
 *   return NextResponse.json({ success: true, data: { userId } });
 * });
 * ```
 */
export function withSession<T = any>(
  handler: (
    request: NextRequest,
    context: { user: { userId: string; email: string; tenantId: string } }
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    const validation = await validateSession(request);

    if (!validation.valid) {
      return validation.response as NextResponse<T>;
    }

    // Call the actual handler with user context
    return handler(request, { user: validation.user! });
  };
}

/**
 * Middleware to check tenant isolation
 * Ensures user can only access data from their tenant
 */
export function checkTenantAccess(
  userTenantId: string,
  requestedTenantId: string
): boolean {
  // In multi-tenant setup, users can only access their own tenant
  // Admin users might have access to all tenants (implement role check here)
  return userTenantId === requestedTenantId;
}

/**
 * Extract tenant ID from query params or request body
 */
export function getTenantIdFromRequest(request: NextRequest): string | null {
  // Try query params first
  const queryTenantId = request.nextUrl.searchParams.get('tenantId');
  if (queryTenantId) return queryTenantId;

  // Could also check request body for POST/PUT requests
  // This would require reading the body, which we'll skip for now
  // as it's better to use query params for tenant filtering

  return null;
}

/**
 * Wrapper that includes tenant isolation check
 *
 * @example
 * ```typescript
 * import { withSessionAndTenant } from '@/lib/middleware/session.middleware';
 *
 * export const GET = withSessionAndTenant(async (request, { user, tenantId }) => {
 *   // User is authenticated and tenantId is validated
 *   // You can safely query data for this tenant
 *
 *   const employees = await prisma.employee.findMany({
 *     where: { tenantId }
 *   });
 *
 *   return NextResponse.json({ success: true, data: employees });
 * });
 * ```
 */
export function withSessionAndTenant<T = any>(
  handler: (
    request: NextRequest,
    context: {
      user: { userId: string; email: string; tenantId: string };
      tenantId: string;
    }
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    // First validate session
    const validation = await validateSession(request);

    if (!validation.valid) {
      return validation.response as NextResponse<T>;
    }

    const user = validation.user!;

    // Get requested tenant ID
    const requestedTenantId = getTenantIdFromRequest(request);

    // If no tenant ID provided, use user's tenant
    const tenantId = requestedTenantId || user.tenantId;

    // Check tenant access
    if (requestedTenantId && !checkTenantAccess(user.tenantId, requestedTenantId)) {
      logger.warn(
        {
          userId: user.userId,
          userTenant: user.tenantId,
          requestedTenant: requestedTenantId,
        },
        'Tenant access denied'
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E1003',
            message: 'Access denied',
            details: 'You do not have access to this tenant',
          },
        },
        { status: 403 }
      ) as NextResponse<T>;
    }

    // Call the actual handler with user and tenant context
    return handler(request, { user, tenantId });
  };
}

/**
 * Refresh token middleware
 * Use this endpoint to refresh access tokens using refresh token
 */
export async function handleTokenRefresh(request: NextRequest): Promise<NextResponse> {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E1001',
            message: 'No refresh token provided',
          },
        },
        { status: 401 }
      );
    }

    // Refresh the session
    const newTokens = await sessionService.refreshSession(refreshToken);

    if (!newTokens) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E1002',
            message: 'Invalid or expired refresh token',
            details: 'Please log in again',
          },
        },
        { status: 401 }
      );
    }

    // Create response with new tokens
    const response = NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      data: {
        expiresIn: newTokens.expiresIn,
      },
    });

    // Set new cookies
    response.cookies.set('accessToken', newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: newTokens.expiresIn,
      path: '/',
    });

    response.cookies.set('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    logger.error({ error }, 'Error refreshing session');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Internal server error',
          details: 'Error refreshing session',
        },
      },
      { status: 500 }
    );
  }
}
