import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission, RolePermissions } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch access control overview (roles and their permissions)
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.ROLES, Action.READ, permissions);
    if (permissionError) return permissionError;

    // Fetch active roles visible to this tenant: system-wide (null tenantId) +
    // any tenant-owned roles. Cross-tenant private roles must not leak here.
    const roles = await prisma.role.findMany({
      where: {
        isActive: true,
        OR: [{ tenantId: null }, { tenantId: user.tenantId }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        _count: {
          select: { userRoles: true },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });

    // Map roles to their permissions from the RolePermissions system
    const accessControlData = roles.map((role) => {
      const roleKey = role.name.toUpperCase().replace(/\s+/g, '_');
      const rolePermissions = RolePermissions[roleKey] || [];

      return {
        id: role.id,
        name: role.name,
        type: 'Role',
        description: role.description || '',
        permissions: rolePermissions,
        permissionCount: rolePermissions.length,
        usersCount: (role as any)._count?.userRoles || 0,
        status: role.isActive ? 'Active' : 'Inactive',
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: accessControlData,
      meta: {
        total: accessControlData.length,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching access control data:', error as any);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch access control data' },
      { status: 500 }
    );
  }
});

// GET specific role's permissions
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.ROLES, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { roleId } = await request.json();

    if (!roleId) {
      return NextResponse.json({ success: false, error: 'Role ID is required' }, { status: 400 });
    }

    // Fetch the specific role — must be system-wide or owned by this tenant
    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        OR: [{ tenantId: null }, { tenantId: user.tenantId }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        _count: {
          select: { userRoles: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!role) {
      return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
    }

    // Get permissions for this role
    const roleKey = role.name.toUpperCase().replace(/\s+/g, '_');
    const rolePermissions = RolePermissions[roleKey] || [];

    // Group permissions by resource
    const permissionsByResource: Record<string, string[]> = {};
    rolePermissions.forEach((permission) => {
      const [resource, action] = permission.split(':');
      if (!permissionsByResource[resource]) {
        permissionsByResource[resource] = [];
      }
      permissionsByResource[resource].push(action);
    });

    return NextResponse.json({
      success: true,
      data: {
        role: {
          id: role.id,
          name: role.name,
          description: role.description,
          status: role.isActive ? 'Active' : 'Inactive',
          usersCount: (role as any)._count?.userRoles || 0,
        },
        permissions: rolePermissions,
        permissionsByResource,
        totalPermissions: rolePermissions.length,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching role permissions:', error as any);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch role permissions' },
      { status: 500 }
    );
  }
});
