import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { authenticate } from './middleware';
import type { Permission } from './permissions';
import type { JWTPayload } from './jwt';
import { logger } from '@/lib/logger';

export interface EnhancedAuthContext {
  user: JWTPayload;
  permissions: Permission[];
  roles: string[];
  employeeId?: string;
}

/**
 * Enhanced authentication that includes roles and permissions
 */
export async function authenticateWithPermissions(
  request: NextRequest
): Promise<
  | { context: EnhancedAuthContext; error: null }
  | { context: null; error: NextResponse }
> {
  // First, perform basic authentication
  const { user, error } = await authenticate(request);

  if (error) {
    return { context: null, error };
  }

  try {
    // Fetch user with employee information and roles from database
    const userWithRoles = await prisma.user.findUnique({
      where: { id: user!.userId },
      select: {
        id: true,
        email: true,
        tenantId: true,
        employee: {
          select: {
            id: true,
          },
        },
        roles: {
          where: {
            OR: [
              { expiresAt: null }, // No expiration
              { expiresAt: { gt: new Date() } }, // Not expired
            ],
          },
          select: {
            role: {
              select: {
                code: true,
                name: true,
                isActive: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        resource: true,
                        action: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      logger.warn({ userId: user!.userId }, 'User not found during enhanced auth');
      return {
        context: null,
        error: NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 401 }
        ),
      };
    }

    // Extract role codes from database
    const roles = userWithRoles.roles
      .filter((ur) => ur.role.isActive)
      .map((ur) => ur.role.code);

    // If user has no roles, assign default EMPLOYEE role
    if (roles.length === 0) {
      logger.warn({
        userId: user!.userId,
        email: userWithRoles.email
      }, 'User has no roles assigned, defaulting to EMPLOYEE');
      roles.push('EMPLOYEE');
    }

    // Aggregate permissions from all roles
    const permissionSet = new Set<Permission>();

    for (const userRole of userWithRoles.roles) {
      if (!userRole.role.isActive) continue;

      for (const rolePerm of userRole.role.permissions) {
        const permission: Permission = `${rolePerm.permission.resource}:${rolePerm.permission.action}`;
        permissionSet.add(permission);
      }
    }

    const permissions = Array.from(permissionSet);

    logger.info({
      userId: user!.userId,
      roles: roles.length,
      permissions: permissions.length
    }, 'Enhanced authentication successful');

    const context: EnhancedAuthContext = {
      user: user!,
      permissions,
      roles,
      employeeId: userWithRoles.employee?.id,
    };

    return { context, error: null };
  } catch {
    logger.error({ error, userId: user!.userId }, 'Enhanced authentication error');
    return {
      context: null,
      error: NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Higher-order function to wrap API routes with enhanced authentication
 */
export function withEnhancedAuth<T = any>(
  handler: (
    request: NextRequest,
    context: T & EnhancedAuthContext
  ) => Promise<Response>
) {
  return async (request: NextRequest, routeContext: T) => {
    const { context, error } = await authenticateWithPermissions(request);

    if (error) {
      return error;
    }

    // Merge enhanced auth context with route context
    const enhancedContext = {
      ...routeContext,
      ...context!,
    };

    return handler(request, enhancedContext);
  };
}
