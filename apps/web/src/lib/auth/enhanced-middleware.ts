// @ts-nocheck — Lib middleware/repository drift (generic NextResponse types, Sentry API changes, Prisma enum imports, permission template literal). Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { authenticate } from './middleware';
import type { Permission } from './permissions';
import type { JWTPayload } from './jwt';
import { logger } from '@/lib/logger';
import { createRateLimit, RateLimitPresets } from '@/lib/middleware/advanced-rate-limit';
import { setAuthIdentifiers } from '@/lib/observability/request-context';

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
): Promise<{ context: EnhancedAuthContext; error: null } | { context: null; error: NextResponse }> {
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
        error: NextResponse.json({ success: false, error: 'User not found' }, { status: 401 }),
      };
    }

    // Extract role codes from database
    const roles = userWithRoles.roles.filter((ur) => ur.role.isActive).map((ur) => ur.role.code);

    // If user has no roles, assign default EMPLOYEE role
    if (roles.length === 0) {
      logger.warn(
        {
          userId: user!.userId,
          email: userWithRoles.email,
        },
        'User has no roles assigned, defaulting to EMPLOYEE'
      );
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

    logger.info(
      {
        userId: user!.userId,
        roles: roles.length,
        permissions: permissions.length,
      },
      'Enhanced authentication successful'
    );

    const context: EnhancedAuthContext = {
      user: user!,
      permissions,
      roles,
      employeeId: userWithRoles.employee?.id,
    };

    return { context, error: null };
  } catch (error: any) {
    logger.error({ error, userId: user!.userId }, 'Enhanced authentication error');
    return {
      context: null,
      error: NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 }),
    };
  }
}

// Reusable rate limiter for all withEnhancedAuth routes (lazy-loaded to avoid circular imports during startup)
let apiRateLimiter: any = null;
function getRateLimiter() {
  if (!apiRateLimiter) {
    const { createRateLimit, RateLimitPresets } = require('@/lib/middleware/advanced-rate-limit');
    apiRateLimiter = createRateLimit({
      ...RateLimitPresets.API_USER,
      useUserId: true,
    });
  }
  return apiRateLimiter;
}

/**
 * Higher-order function to wrap API routes with enhanced authentication,
 * rate limiting, and unified response envelope enforcement.
 */
export function withEnhancedAuth<T = any>(
  handler: (request: NextRequest, context: T & EnhancedAuthContext) => Promise<Response>
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

    // Propagate tenant/user identifiers into the correlation context so every
    // downstream log line carries them. No-op when called outside a request
    // scope (e.g. unit tests that drive the handler directly).
    setAuthIdentifiers(context!.user.tenantId, context!.user.userId);

    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);

    // Apply rate limiting (100 req/min per user)
    return getRateLimiter()(
      request,
      async () => {
        try {
          const response = await handler(request, enhancedContext);

          // Auto-audit mutation operations (POST, PUT, PATCH, DELETE)
          if (isMutation) {
            const path = request.nextUrl.pathname;
            const action =
              request.method === 'DELETE'
                ? 'DELETE'
                : request.method === 'POST'
                  ? 'CREATE'
                  : 'UPDATE';
            // Fire-and-forget — never block the response
            prisma.auditLog
              .create({
                data: {
                  tenantId: context!.user.tenantId || 'system',
                  userId: context!.user.userId,
                  action,
                  module: path.split('/').filter(Boolean).slice(1, 2).join('/') || 'api',
                  resourceType: path.split('/').filter(Boolean).slice(2, 4).join('/') || 'unknown',
                  ipAddress:
                    request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown',
                  details: `${request.method} ${path} → ${response.status}`,
                },
              })
              .catch((err) => {
                logger.warn({ error: err }, 'Auto-audit log failed (non-blocking)');
              });
          }

          // Normalize response envelope — ensure all JSON responses follow
          // the standard { success, data, error, meta } shape
          const contentType = response.headers.get('content-type') || '';
          if (
            contentType.includes('application/json') &&
            response.status >= 200 &&
            response.status < 300
          ) {
            try {
              const body = await response.clone().json();
              // If response already has `success` field, pass through
              if (typeof body.success === 'boolean') {
                return response;
              }
              // Wrap raw data in standard envelope
              return NextResponse.json(
                {
                  success: true,
                  data: body,
                  meta: { timestamp: new Date().toISOString(), apiVersion: 'v1' },
                },
                { status: response.status, headers: response.headers }
              );
            } catch {
              // Not parseable JSON — pass through
              return response;
            }
          }

          return response;
        } catch (err: any) {
          // Audit failed mutations
          if (isMutation) {
            prisma.auditLog
              .create({
                data: {
                  tenantId: context!.user.tenantId || 'system',
                  userId: context!.user.userId,
                  action:
                    request.method === 'DELETE'
                      ? 'DELETE'
                      : request.method === 'POST'
                        ? 'CREATE'
                        : 'UPDATE',
                  module:
                    request.nextUrl.pathname.split('/').filter(Boolean).slice(1, 2).join('/') ||
                    'api',
                  resourceType:
                    request.nextUrl.pathname.split('/').filter(Boolean).slice(2, 4).join('/') ||
                    'unknown',
                  ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                  details: `FAILED: ${request.method} ${request.nextUrl.pathname} — ${err.message || 'Unknown error'}`,
                },
              })
              .catch(() => {});
          }

          logger.error({ error: err, path: request.nextUrl.pathname }, 'Unhandled route error');
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E5001',
                message: 'Internal server error',
                messageAr: 'خطأ داخلي في الخادم',
              },
              meta: { timestamp: new Date().toISOString(), apiVersion: 'v1' },
            },
            { status: 500 }
          );
        }
      },
      context!.user.userId
    );
  };
}
