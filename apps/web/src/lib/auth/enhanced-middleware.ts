import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { authenticate } from './middleware';
import { Permission, getRolePermissions } from './permissions';
import { JWTPayload } from './jwt';

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
    // Fetch user with employee information
    // For now, we'll use a simple role system based on email or a default
    // In production, you'd fetch this from a UserRole junction table

    const userWithEmployee = await prisma.user.findUnique({
      where: { id: user!.userId },
      select: {
        id: true,
        email: true,
        employee: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!userWithEmployee) {
      return {
        context: null,
        error: NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 401 }
        ),
      };
    }

    // TODO: Fetch actual roles from database when UserRole table exists
    // For now, assign default role based on email or use EMPLOYEE as default
    const roles = determineUserRoles(userWithEmployee.email);

    // Aggregate permissions from all roles
    const permissions = roles.flatMap((role) => getRolePermissions(role));

    // Remove duplicates
    const uniquePermissions = [...new Set(permissions)];

    const context: EnhancedAuthContext = {
      user: user!,
      permissions: uniquePermissions,
      roles,
      employeeId: userWithEmployee.employee?.id,
    };

    return { context, error: null };
  } catch (error) {
    console.error('Enhanced authentication error:', error);
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
 * Determine user roles based on email (temporary solution)
 * TODO: Replace with database lookup when UserRole table exists
 */
function determineUserRoles(email: string): string[] {
  // Super admin emails (configure via environment variable in production)
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || '').split(',');
  if (superAdminEmails.some((e) => e.trim().toLowerCase() === email.toLowerCase())) {
    return ['SUPER_ADMIN'];
  }

  // Admin domain check (example: @admin.company.com)
  if (email.includes('@admin.') || email.startsWith('admin@')) {
    return ['ADMIN'];
  }

  // HR domain check
  if (email.includes('@hr.') || email.startsWith('hr@')) {
    return ['HR_MANAGER'];
  }

  // Manager check (you can implement more sophisticated logic)
  if (email.includes('manager@')) {
    return ['MANAGER'];
  }

  // Default role
  return ['EMPLOYEE'];
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
