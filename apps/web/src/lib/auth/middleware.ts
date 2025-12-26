import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import type { JWTPayload } from './jwt';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { logger } from '@/lib/logger';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
  userId?: string;
  tenantId?: string;
  sessionId?: string;
}

/**
 * Authentication middleware for API routes
 * Verifies JWT token and attaches user info to request
 */
export async function authenticate(
  request: NextRequest
): Promise<{ user: JWTPayload; error: null } | { user: null; error: NextResponse }> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, error: 'No authentication token provided' },
          { status: 401 }
        ),
      };
    }

    // Verify token
    let decoded: JWTPayload;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return {
        user: null,
        error: NextResponse.json(
          {
            success: false,
            error: error instanceof Error ? error.message : 'Invalid token'
          },
          { status: 401 }
        ),
      };
    }

    // Validate token type
    if (decoded.type !== 'access') {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, error: 'Invalid token type' },
          { status: 401 }
        ),
      };
    }

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        status: true,
        tenantId: true,
        mfaEnabled: true,
      },
    });

    if (!user) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 401 }
        ),
      };
    }

    if (user.status !== 'Active') {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, error: 'User account is not active' },
          { status: 403 }
        ),
      };
    }

    // Verify session if sessionId is present
    if (decoded.sessionId) {
      const session = await prisma.userSession.findUnique({
        where: { id: decoded.sessionId },
        select: { status: true },
      });

      if (!session || session.status !== 'Active') {
        return {
          user: null,
          error: NextResponse.json(
            { success: false, error: 'Session is not active' },
            { status: 401 }
          ),
        };
      }

      // Update session last active timestamp
      await prisma.userSession.update({
        where: { id: decoded.sessionId },
        data: { lastActive: new Date() },
      });
    }

    return { user: decoded, error: null };
  } catch (error) {
    logger.error({ error }, 'Authentication error');
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Higher-order function to wrap API route handlers with authentication
 */
export function withAuth<T = any>(
  handler: (request: NextRequest, context: T & { user: JWTPayload }) => Promise<Response>
) {
  return async (request: NextRequest, context: T) => {
    const { user, error } = await authenticate(request);

    if (error) {
      return error;
    }

    // Attach user to context
    const authenticatedContext = {
      ...context,
      user: user!,
    };

    return handler(request, authenticatedContext);
  };
}

/**
 * Validates tenant isolation - ensures user can only access their tenant's data
 */
export function validateTenantAccess(userTenantId: string, resourceTenantId: string): boolean {
  return userTenantId === resourceTenantId;
}

/**
 * Middleware to enforce tenant isolation
 */
export function requireTenantAccess(userTenantId: string, resourceTenantId: string): NextResponse | null {
  if (!validateTenantAccess(userTenantId, resourceTenantId)) {
    return NextResponse.json(
      { success: false, error: 'Access denied: Tenant mismatch' },
      { status: 403 }
    );
  }
  return null;
}
