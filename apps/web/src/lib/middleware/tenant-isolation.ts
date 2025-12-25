/**
 * Tenant Isolation Middleware
 *
 * Ensures data isolation between tenants by validating that users
 * can only access resources belonging to their own tenant
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { TenantIsolationError } from '@/lib/errors';
import logger from '@/lib/logger';

/**
 * Tenant isolation configuration
 */
export interface TenantIsolationConfig {
  /**
   * Whether to enforce strict tenant isolation
   * @default true
   */
  strict?: boolean;

  /**
   * Custom error message
   */
  message?: string;

  /**
   * Handler called when isolation is violated
   */
  onViolation?: (request: NextRequest, details: any) => void;
}

/**
 * Validate that a resource belongs to the user's tenant
 *
 * @param resourceTenantId - The tenant ID of the resource being accessed
 * @param userTenantId - The tenant ID of the authenticated user
 * @param resourceType - Type of resource being accessed (for logging)
 * @param resourceId - ID of resource being accessed (for logging)
 * @throws TenantIsolationError if tenant IDs don't match
 */
export function validateTenantAccess(
  resourceTenantId: string | null | undefined,
  userTenantId: string,
  resourceType: string,
  resourceId?: string
): void {
  if (!resourceTenantId) {
    logger.warn(
      {
        resourceType,
        resourceId,
        userTenantId,
      },
      'Resource has no tenant ID'
    );
    throw new TenantIsolationError(
      'Resource does not belong to any tenant',
      {
        resourceType,
        resourceId,
      }
    );
  }

  if (resourceTenantId !== userTenantId) {
    logger.error(
      {
        resourceType,
        resourceId,
        resourceTenantId,
        userTenantId,
      },
      'Tenant isolation violation detected'
    );

    throw new TenantIsolationError(
      'You do not have access to this resource',
      {
        resourceType,
        resourceId,
        resourceTenantId,
        userTenantId,
      }
    );
  }
}

/**
 * Validate that multiple resources belong to the user's tenant
 *
 * @param resources - Array of resources to validate
 * @param userTenantId - The tenant ID of the authenticated user
 * @param resourceType - Type of resources being accessed
 * @throws TenantIsolationError if any resource doesn't match tenant
 */
export function validateMultipleTenantAccess(
  resources: Array<{ tenantId?: string | null; id?: string }>,
  userTenantId: string,
  resourceType: string
): void {
  const violations = resources.filter(
    (resource) => resource.tenantId && resource.tenantId !== userTenantId
  );

  if (violations.length > 0) {
    logger.error(
      {
        resourceType,
        violationCount: violations.length,
        userTenantId,
        violatedTenants: violations.map((v) => v.tenantId),
      },
      'Multiple tenant isolation violations detected'
    );

    throw new TenantIsolationError(
      `${violations.length} resource(s) do not belong to your tenant`,
      {
        resourceType,
        violationCount: violations.length,
        userTenantId,
      }
    );
  }
}

/**
 * Add tenant filter to query parameters
 *
 * Ensures all queries are automatically filtered by tenant
 *
 * @param userTenantId - The tenant ID to filter by
 * @returns Prisma where clause with tenant filter
 */
export function addTenantFilter(userTenantId: string) {
  return {
    tenantId: userTenantId,
  };
}

/**
 * Middleware to enforce tenant isolation on API routes
 *
 * Usage:
 * ```typescript
 * export const GET = withTenantIsolation(async (request, { user }) => {
 *   // All queries will automatically include tenant filter
 *   const users = await prisma.user.findMany({
 *     where: addTenantFilter(user.tenantId),
 *   });
 *   return NextResponse.json({ data: users });
 * });
 * ```
 */
export function withTenantIsolation(config: TenantIsolationConfig = {}) {
  const { strict = true, message, onViolation } = config;

  return function tenantIsolationMiddleware<
    T extends (request: NextRequest, context: any) => Promise<NextResponse>
  >(handler: T): T {
    return (async (request: NextRequest, context: any) => {
      try {
        // Handler should implement tenant checks
        const response = await handler(request, context);

        return response;
      } catch {
        if (error instanceof TenantIsolationError) {
          if (onViolation) {
            onViolation(request, error.context);
          }

          logger.error(
            {
              error: error.message,
              context: error.context,
              url: request.url,
            },
            'Tenant isolation violation'
          );

          return NextResponse.json(
            {
              success: false,
              error: {
                message: message || error.message,
                code: error.code,
              },
            },
            { status: error.statusCode }
          );
        }
        throw error;
      }
    }) as T;
  };
}

/**
 * Helper to check if a user can access cross-tenant resources
 *
 * Super admins or system users might have this permission
 *
 * @param user - The authenticated user
 * @returns true if user can access cross-tenant resources
 */
export function canAccessCrossTenant(user: any): boolean {
  // Check if user has super admin role
  if (user.roleId === 'role-super-admin') {
    return true;
  }

  // Check if user has cross-tenant permission
  if (user.permissions?.includes('cross_tenant_access')) {
    return true;
  }

  return false;
}

/**
 * Validate tenant access with super admin bypass
 *
 * @param resourceTenantId - The tenant ID of the resource
 * @param user - The authenticated user
 * @param resourceType - Type of resource
 * @param resourceId - ID of resource
 */
export function validateTenantAccessWithBypass(
  resourceTenantId: string | null | undefined,
  user: any,
  resourceType: string,
  resourceId?: string
): void {
  // Super admins can access cross-tenant resources
  if (canAccessCrossTenant(user)) {
    logger.info(
      {
        userId: user.userId,
        resourceType,
        resourceId,
        resourceTenantId,
        userTenantId: user.tenantId,
      },
      'Cross-tenant access granted (super admin)'
    );
    return;
  }

  // Regular users must match tenant
  validateTenantAccess(resourceTenantId, user.tenantId, resourceType, resourceId);
}

/**
 * Audit log for tenant isolation violations
 *
 * @param prisma - Prisma client instance
 * @param violation - Details of the violation
 */
export async function logTenantViolation(
  prisma: any,
  violation: {
    userId: string;
    resourceType: string;
    resourceId?: string;
    resourceTenantId?: string;
    userTenantId: string;
    ipAddress?: string;
  }
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: violation.userId,
        action: 'TENANT_VIOLATION',
        module: 'Security',
        details: JSON.stringify({
          resourceType: violation.resourceType,
          resourceId: violation.resourceId,
          resourceTenantId: violation.resourceTenantId,
          userTenantId: violation.userTenantId,
          timestamp: new Date().toISOString(),
        }),
        ipAddress: violation.ipAddress || 'unknown',
        severity: 'HIGH',
      },
    });

    logger.error(
      {
        violation,
      },
      'Tenant isolation violation logged to audit trail'
    );
  } catch {
    logger.error(
      {
        error,
        violation,
      },
      'Failed to log tenant violation to audit trail'
    );
  }
}
