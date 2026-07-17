// @ts-nocheck — Lib drift / missing typings. Tracked under #29.
/**
 * API Route Wrapper Utilities
 *
 * Provides standardized wrappers for Next.js API routes with:
 * - Consistent error handling
 * - Automatic logging
 * - Request validation
 * - Authentication/authorization
 * - Rate limiting integration
 * - Standardized response formats
 *
 * @module lib/api/route-wrapper
 *
 * @example
 * ```typescript
 * import { createProtectedRoute } from '@/lib/api/route-wrapper';
 *
 * export const GET = createProtectedRoute(
 *   async (request, context) => {
 *     // Your route logic here
 *     return { users: [] };
 *   },
 *   {
 *     requiredPermissions: ['users:read'],
 *     rateLimit: 'API_USER',
 *   }
 * );
 * ```
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

/**
 * IMPORTANT:
 * This file is used by many route handlers under app/api.
 * Any failure during module initialization can prevent Next from properly
 * wiring the route and can surface as 404.
 *
 * To avoid that, we lazily load optional heavy dependencies inside request
 * handlers (auth/rate-limit/logger/jwt/prisma).
 */

// Small helper to dynamically load dependencies without crashing module init.
async function safeImport<T>(factory: () => Promise<T>): Promise<T | null> {
  try {
    return await factory();
  } catch {
    return null;
  }
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Authenticated request context
 */
export interface AuthContext {
  userId: string;
  email: string;
  tenantId: string;
  sessionId: string;
  roles: string[];
  permissions: string[];
}

/**
 * Route handler function signature
 */
export type RouteHandler<T = any> = (
  request: NextRequest,
  context: { params?: any; auth?: AuthContext; body?: any }
) => Promise<T | NextResponse>;

/**
 * Route configuration options
 */
export interface RouteConfig {
  /**
   * Required permissions for this route
   * Format: 'resource:action' (e.g., 'users:read', 'employees:create')
   */
  requiredPermissions?: string[];

  /**
   * Rate limit configuration
   * Can be a preset name or custom config
   */
  rateLimit?: string | any;

  /**
   * Request body validation schema
   */
  bodySchema?: ZodSchema;

  /**
   * Query parameters validation schema
   */
  querySchema?: ZodSchema;

  /**
   * Custom error messages
   */
  errorMessages?: {
    unauthorized?: string;
    forbidden?: string;
    validation?: string;
    rateLimit?: string;
  };

  /**
   * Whether to skip tenant isolation check
   * Use with caution - only for system-wide operations
   */
  skipTenantCheck?: boolean;
}

/**
 * Create a standardized error response
 *
 * @param error - Error message or Error object
 * @param status - HTTP status code
 * @param details - Additional error details
 * @returns NextResponse with error
 */
export function createErrorResponse(
  error: string | Error,
  status: number = 500,
  details?: any
): NextResponse {
  const message = error instanceof Error ? error.message : error;

  const response: ApiResponse = {
    success: false,
    error: message,
    ...(details && { details }),
  };

  console.error('API error response', {
    error: message,
    status,
    details,
  });

  return NextResponse.json(response, { status });
}

/**
 * Create a standardized success response
 *
 * @param data - Response data
 * @param status - HTTP status code
 * @returns NextResponse with data
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  return NextResponse.json(response, { status });
}

/**
 * Extract and verify authentication from request
 *
 * @param request - Next.js request object
 * @returns Authentication context or null
 */
async function extractAuth(request: NextRequest): Promise<AuthContext | null> {
  try {
    const loggerMod = await safeImport(async () => import('@/lib/logger'));
    const logger = loggerMod && (loggerMod as any).logger ? (loggerMod as any).logger : null;

    const jwtMod = await safeImport(async () => import('@/lib/auth/jwt'));
    const cookiesMod = await safeImport(async () => import('@/lib/auth/cookies'));
    const dbMod = await safeImport(async () => import('@aura/database'));

    const verifyAccessTokenFn = jwtMod && (jwtMod as any).verifyAccessToken;
    const ACCESS_COOKIE_LOCAL = cookiesMod && (cookiesMod as any).ACCESS_COOKIE;
    const prismaLocal = dbMod && (dbMod as any).prisma;

    // If auth subsystem isn't available, treat as unauthorized.
    if (!verifyAccessTokenFn || !ACCESS_COOKIE_LOCAL || !prismaLocal) {
      return null;
    }

    // Get token from Authorization header or cookie fallback
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = request.cookies.get(ACCESS_COOKIE_LOCAL)?.value ?? null;
    }

    if (!token) return null;

    // Verify JWT token
    const payload = verifyAccessTokenFn(token);
    if (!payload) return null;

    // DEV BYPASS: If using the dev-login token, bypass DB lookup
    if (process.env.NODE_ENV !== 'production' && payload.userId === 'dev-user') {
      return {
        userId: payload.userId,
        email: payload.email || 'dev@auraos.local',
        tenantId: payload.tenantId || 'dev-tenant',
        sessionId: payload.sessionId,
        roles: ['SUPER_ADMIN'],
        permissions: ['*:*'], // Give all permissions for local dev
      };
    }

    // Get user with roles and permissions
    const user = await prismaLocal.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        tenantId: true,
        status: true,
        roles: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          select: {
            role: {
              select: {
                code: true,
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

    if (!user || user.status !== 'Active') return null;

    const roles = user.roles.filter((ur: any) => ur.role.isActive).map((ur: any) => ur.role.code);

    const permissionSet = new Set<string>();
    for (const userRole of user.roles as any[]) {
      if (!userRole.role.isActive) continue;
      for (const rolePerm of userRole.role.permissions as any[]) {
        const permission = `${rolePerm.permission.resource}:${rolePerm.permission.action}`;
        permissionSet.add(permission);
      }
    }

    return {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      sessionId: payload.sessionId,
      roles,
      permissions: Array.from(permissionSet),
    };
  } catch (error: any) {
    const loggerMod = await safeImport(async () => import('@/lib/logger'));
    const logger = loggerMod && (loggerMod as any).logger ? (loggerMod as any).logger : null;
    if (logger) logger.error({ error }, 'Failed to extract authentication');
    return null;
  }
}

/**
 * Check if user has required permissions
 *
 * @param auth - Authentication context
 * @param requiredPermissions - Required permissions
 * @returns True if authorized
 */
function checkPermissions(auth: AuthContext, requiredPermissions: string[]): boolean {
  // SUPER_ADMIN has all permissions
  if (auth.roles.includes('SUPER_ADMIN')) {
    return true;
  }

  // Check if user has all required permissions
  return requiredPermissions.every((perm) => auth.permissions.includes(perm));
}

/**
 * Validate request data against a Zod schema
 *
 * @param data - Data to validate
 * @param schema - Zod schema
 * @returns Validated data
 * @throws ZodError if validation fails
 */
function validateData<T>(data: any, schema: ZodSchema<T>): T {
  return schema.parse(data);
}

/**
 * Create a protected API route with authentication and authorization
 *
 * @param handler - Route handler function
 * @param config - Route configuration
 * @returns Next.js route handler
 *
 * @example
 * ```typescript
 * export const GET = createProtectedRoute(
 *   async (request, { auth }) => {
 *     const users = await userService.listUsers(auth.tenantId);
 *     return { users };
 *   },
 *   {
 *     requiredPermissions: ['users:read'],
 *     rateLimit: 'API_USER',
 *   }
 * );
 * ```
 */
export function createProtectedRoute<T = any>(
  handler: RouteHandler<T>,
  config: RouteConfig = {}
): (request: NextRequest, context?: any) => Promise<NextResponse> {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Extract authentication
      const auth = await extractAuth(request);

      if (!auth) {
        return createErrorResponse(
          config.errorMessages?.unauthorized || 'Unauthorized. Please login.',
          401
        );
      }

      // Check permissions if required
      if (config.requiredPermissions && config.requiredPermissions.length > 0) {
        const hasPermission = checkPermissions(auth, config.requiredPermissions);

        if (!hasPermission) {
          console.warn('Insufficient permissions', {
            userId: auth.userId,
            requiredPermissions: config.requiredPermissions,
            userPermissions: auth.permissions,
          });

          return createErrorResponse(
            config.errorMessages?.forbidden || 'Insufficient permissions',
            403
          );
        }
      }

      // Apply rate limiting if configured
      if (config.rateLimit) {
        const rateMod = await safeImport(
          async () => import('@/lib/middleware/advanced-rate-limit')
        );

        const createRateLimitFn = rateMod && (rateMod as any).createRateLimit;
        const RateLimitPresetsLocal = rateMod && (rateMod as any).RateLimitPresets;

        if (!createRateLimitFn || !RateLimitPresetsLocal) {
          // If rate-limit subsystem is unavailable, continue without rate limiting.
        } else {
          const rateLimitConfig =
            typeof config.rateLimit === 'string'
              ? RateLimitPresetsLocal[config.rateLimit]
              : (config.rateLimit as RateLimitConfig);

          const rateLimiter = createRateLimitFn(rateLimitConfig);

          const response = await rateLimiter(
            request,
            async () => {
              return new NextResponse();
            },
            auth.userId
          );

          if (response.status === 429) return response;
        }
      }

      // Validate request body if schema provided
      let validatedBody: any = null;
      if (config.bodySchema && request.method !== 'GET') {
        try {
          validatedBody = await request.json();
          validateData(validatedBody, config.bodySchema);
        } catch (error: any) {
          if (error instanceof ZodError) {
            return createErrorResponse(
              config.errorMessages?.validation || 'Validation failed',
              400,
              error.errors
            );
          }
          throw error;
        }
      }

      // Validate query parameters if schema provided
      if (config.querySchema) {
        try {
          const url = new URL(request.url);
          const query = Object.fromEntries(url.searchParams);
          validateData(query, config.querySchema);
        } catch (error: any) {
          if (error instanceof ZodError) {
            return createErrorResponse(
              config.errorMessages?.validation || 'Validation failed',
              400,
              error.errors
            );
          }
          throw error;
        }
      }

      // Seed correlation context with auth identifiers — no-op when called
      // outside an active request scope (e.g. unit tests).
      const obsMod = await safeImport(async () => import('@/lib/observability/request-context'));
      if (obsMod && (obsMod as any).setAuthIdentifiers) {
        (obsMod as any).setAuthIdentifiers(auth.tenantId, auth.userId);
      }

      // Execute handler with validated body pre-parsed
      const result = await handler(request, { ...context, auth, body: validatedBody });

      // If handler returns NextResponse, use it directly
      if (result instanceof NextResponse) {
        return result;
      }

      // Otherwise, wrap in success response
      return createSuccessResponse(result);
    } catch (error: any) {
      const loggerMod = await safeImport(async () => import('@/lib/logger'));
      const logger = loggerMod && (loggerMod as any).logger ? (loggerMod as any).logger : null;

      if (logger) {
        logger.error(
          {
            error,
            method: request.method,
            url: request.url,
          },
          'Protected route error'
        );
      }

      return createErrorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      );
    }
  };
}

/**
 * Create a public API route (no authentication required)
 *
 * @param handler - Route handler function
 * @param config - Route configuration
 * @returns Next.js route handler
 *
 * @example
 * ```typescript
 * export const POST = createPublicRoute(
 *   async (request) => {
 *     const body = await request.json();
 *     // Handle public request
 *     return { message: 'Success' };
 *   },
 *   {
 *     rateLimit: 'PUBLIC',
 *     bodySchema: loginSchema,
 *   }
 * );
 * ```
 */
export function createPublicRoute<T = any>(
  handler: RouteHandler<T>,
  config: Omit<RouteConfig, 'requiredPermissions'> = {}
): (request: NextRequest, context?: any) => Promise<NextResponse> {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Apply rate limiting if configured
      if (config.rateLimit) {
        const rateMod = await safeImport(
          async () => import('@/lib/middleware/advanced-rate-limit')
        );
        if (rateMod && (rateMod as any).createRateLimit && (rateMod as any).RateLimitPresets) {
          const rateLimitConfig =
            typeof config.rateLimit === 'string'
              ? (rateMod as any).RateLimitPresets[config.rateLimit]
              : config.rateLimit;

          const rateLimiter = (rateMod as any).createRateLimit(rateLimitConfig);

          const response = await rateLimiter(request, async () => {
            return new NextResponse();
          });

          if (response.status === 429) {
            return response;
          }
        }
      }

      // Validate request body if schema provided
      if (config.bodySchema && request.method !== 'GET') {
        try {
          const body = await request.json();
          validateData(body, config.bodySchema);
        } catch (error: any) {
          if (error instanceof ZodError) {
            return createErrorResponse(
              config.errorMessages?.validation || 'Validation failed',
              400,
              error.errors
            );
          }
          throw error;
        }
      }

      // Validate query parameters if schema provided
      if (config.querySchema) {
        try {
          const url = new URL(request.url);
          const query = Object.fromEntries(url.searchParams);
          validateData(query, config.querySchema);
        } catch (error: any) {
          if (error instanceof ZodError) {
            return createErrorResponse(
              config.errorMessages?.validation || 'Validation failed',
              400,
              error.errors
            );
          }
          throw error;
        }
      }

      // Execute handler
      const result = await handler(request, context);

      // If handler returns NextResponse, use it directly
      if (result instanceof NextResponse) {
        return result;
      }

      // Otherwise, wrap in success response
      return createSuccessResponse(result);
    } catch (error: any) {
      console.error('Public route error', {
        error,
        method: request.method,
        url: request.url,
      });

      return createErrorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      );
    }
  };
}

/**
 * Helper to get IP address from request
 *
 * @param request - Next.js request object
 * @returns IP address
 */
export function getIpAddress(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

/**
 * Helper to get user agent from request
 *
 * @param request - Next.js request object
 * @returns User agent string
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}
