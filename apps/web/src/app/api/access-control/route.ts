import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission, RolePermissions } from '@/lib/auth';

// GET - Fetch access control overview (roles and their permissions)
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.ROLES, Action.READ, permissions);
    if (permissionError) return permissionError;

    // Fetch all active roles
    const roles = await prisma.role.findMany({
      where: { status: 'Active' },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        usersCount: true,
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
        usersCount: role.usersCount,
        status: role.status,
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
  } catch (error) {
    console.error('Error fetching access control data:', error);
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
      return NextResponse.json(
        { success: false, error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // Fetch the specific role
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        usersCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
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
          status: role.status,
          usersCount: role.usersCount,
        },
        permissions: rolePermissions,
        permissionsByResource,
        totalPermissions: rolePermissions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch role permissions' },
      { status: 500 }
    );
  }
});
