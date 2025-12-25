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

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import type { ZodSchema} from 'zod';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { prisma } from '@aura/database';
import type {
  RateLimitConfig} from '@/lib/middleware/advanced-rate-limit';
import {
  createRateLimit,
  RateLimitPresets,
} from '@/lib/middleware/advanced-rate-limit';

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
  context: { params?: any; auth?: AuthContext }
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
  rateLimit?: keyof typeof RateLimitPresets | RateLimitConfig;

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

  logger.error(
    {
      error: message,
      status,
      details,
    },
    'API error response'
  );

  return NextResponse.json(response, { status });
}

/**
 * Create a standardized success response
 *
 * @param data - Response data
 * @param status - HTTP status code
 * @returns NextResponse with data
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
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
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const payload = verifyAccessToken(token);
    if (!payload) {
      return null;
    }

    // Get user with roles and permissions
    const user = await prisma.user.findUnique({
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

    if (!user || user.status !== 'Active') {
      return null;
    }

    // Extract roles and permissions
    const roles = user.roles
      .filter((ur) => ur.role.isActive)
      .map((ur) => ur.role.code);

    const permissionSet = new Set<string>();
    for (const userRole of user.roles) {
      if (!userRole.role.isActive) continue;
      for (const rolePerm of userRole.role.permissions) {
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
  } catch {
    logger.error({ error }, 'Failed to extract authentication');
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
function checkPermissions(
  auth: AuthContext,
  requiredPermissions: string[]
): boolean {
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
          logger.warn(
            {
              userId: auth.userId,
              requiredPermissions: config.requiredPermissions,
              userPermissions: auth.permissions,
            },
            'Insufficient permissions'
          );

          return createErrorResponse(
            config.errorMessages?.forbidden || 'Insufficient permissions',
            403
          );
        }
      }

      // Apply rate limiting if configured
      if (config.rateLimit) {
        const rateLimitConfig =
          typeof config.rateLimit === 'string'
            ? RateLimitPresets[config.rateLimit]
            : config.rateLimit;

        const rateLimiter = createRateLimit(rateLimitConfig);

        // Apply rate limit (returns response if limited)
        const response = await rateLimiter(
          request,
          async () => {
            // Continue to handler
            return new NextResponse();
          },
          auth.userId
        );

        // If rate limited, return the rate limit response
        if (response.status === 429) {
          return response;
        }
      }

      // Validate request body if schema provided
      if (config.bodySchema && request.method !== 'GET') {
        try {
          const body = await request.json();
          validateData(body, config.bodySchema);
        } catch {
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
        } catch {
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
      const result = await handler(request, { ...context, auth });

      // If handler returns NextResponse, use it directly
      if (result instanceof NextResponse) {
        return result;
      }

      // Otherwise, wrap in success response
      return createSuccessResponse(result);
    } catch {
      logger.error(
        {
          error,
          method: request.method,
          url: request.url,
        },
        'Protected route error'
      );

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
        const rateLimitConfig =
          typeof config.rateLimit === 'string'
            ? RateLimitPresets[config.rateLimit]
            : config.rateLimit;

        const rateLimiter = createRateLimit(rateLimitConfig);

        const response = await rateLimiter(request, async () => {
          return new NextResponse();
        });

        if (response.status === 429) {
          return response;
        }
      }

      // Validate request body if schema provided
      if (config.bodySchema && request.method !== 'GET') {
        try {
          const body = await request.json();
          validateData(body, config.bodySchema);
        } catch {
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
        } catch {
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
    } catch {
      logger.error(
        {
          error,
          method: request.method,
          url: request.url,
        },
        'Public route error'
      );

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
