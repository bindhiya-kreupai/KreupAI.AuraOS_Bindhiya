// @ts-nocheck — Lib middleware/repository drift (generic NextResponse types, Sentry API changes, Prisma enum imports, permission template literal). Tracked under #29.
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import type { JWTPayload } from './jwt';
import type { Permission, Resource, Action} from './permissions';
import { hasPermission, getRolePermissions } from './permissions';

/**
 * Extended context with user permissions
 */
export interface AuthorizedContext {
  user: JWTPayload;
  permissions: Permission[];
  roles: string[];
}

/**
 * Check if user has required permission
 */
export function requirePermission(
  resource: Resource,
  action: Action,
  userPermissions: Permission[]
): NextResponse | null {
  if (!hasPermission(userPermissions, resource, action)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions',
        required: `${resource}:${action}`,
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Check if user has any of the required permissions
 */
export function requireAnyPermission(
  permissions: Array<{ resource: Resource; action: Action }>,
  userPermissions: Permission[]
): NextResponse | null {
  const hasAnyPermission = permissions.some(({ resource, action }) =>
    hasPermission(userPermissions, resource, action)
  );

  if (!hasAnyPermission) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions',
        required: permissions.map(({ resource, action }) => `${resource}:${action}`),
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Check if user has all required permissions
 */
export function requireAllPermissions(
  permissions: Array<{ resource: Resource; action: Action }>,
  userPermissions: Permission[]
): NextResponse | null {
  const missingPermissions = permissions.filter(
    ({ resource, action }) => !hasPermission(userPermissions, resource, action)
  );

  if (missingPermissions.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions',
        missing: missingPermissions.map(({ resource, action }) => `${resource}:${action}`),
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Check if user has required role
 */
export function requireRole(
  requiredRoles: string[],
  userRoles: string[]
): NextResponse | null {
  const hasRole = requiredRoles.some((role) =>
    userRoles.some((userRole) => userRole.toUpperCase() === role.toUpperCase())
  );

  if (!hasRole) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient role permissions',
        required: requiredRoles,
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Higher-order function to wrap API routes with permission checks
 */
export function withPermission<T = any>(
  resource: Resource,
  action: Action,
  handler: (
    request: NextRequest,
    context: T & { user: JWTPayload; permissions: Permission[] }
  ) => Promise<Response>
) {
  return async (
    request: NextRequest,
    context: T & { user: JWTPayload; permissions?: Permission[] }
  ) => {
    // Get user permissions (should be added by withAuth middleware)
    const userPermissions = context.permissions || [];

    // Check permission
    const permissionError = requirePermission(resource, action, userPermissions);
    if (permissionError) {
      return permissionError;
    }

    return handler(request, context);
  };
}

/**
 * Higher-order function to wrap API routes with role checks
 */
export function withRole<T = any>(
  requiredRoles: string[],
  handler: (
    request: NextRequest,
    context: T & { user: JWTPayload; roles: string[] }
  ) => Promise<Response>
) {
  return async (
    request: NextRequest,
    context: T & { user: JWTPayload; roles?: string[] }
  ) => {
    // Get user roles (should be added by enhanced auth middleware)
    const userRoles = context.roles || [];

    // Check role
    const roleError = requireRole(requiredRoles, userRoles);
    if (roleError) {
      return roleError;
    }

    return handler(request, context);
  };
}

/**
 * Resource ownership validation
 * Ensures user can only access their own resources
 */
export function requireOwnership(
  resourceOwnerId: string,
  userId: string,
  options: {
    allowManagers?: boolean;
    managerPermission?: Permission;
    userPermissions?: Permission[];
  } = {}
): NextResponse | null {
  // Check if user owns the resource
  if (resourceOwnerId === userId) {
    return null;
  }

  // Check if user has manager permission
  if (options.allowManagers && options.managerPermission && options.userPermissions) {
    const [resource, action] = options.managerPermission.split(':') as [Resource, Action];
    if (hasPermission(options.userPermissions, resource, action)) {
      return null;
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Access denied: You can only access your own resources',
    },
    { status: 403 }
  );
}
