import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth/enhanced-middleware';
import { logger } from '@/lib/logger';

/**
 * Individual Role Management API - Database-Backed RBAC Implementation
 * Handles GET/PUT/DELETE operations for specific roles
 */

// Validation Schema for updates
const UpdateRoleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  permissionIds: z.array(z.string()).optional(),
});

// GET - Fetch single role by ID
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      if (!permissions.includes('roles:read') && !permissions.includes('roles:manage')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      const roleId = params.id;

      // Fetch role with full details including permissions
      const role = await prisma.role.findFirst({
        where: {
          id: roleId,
          tenantId: user.tenantId, // Ensure tenant isolation
        },
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          isSystem: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          permissions: {
            select: {
              permission: {
                select: {
                  id: true,
                  resource: true,
                  action: true,
                  description: true,
                },
              },
            },
          },
          _count: {
            select: {
              userRoles: true,
            },
          },
        },
      });

      if (!role) {
        return NextResponse.json(
          { success: false, error: 'Role not found' },
          { status: 404 }
        );
      }

      logger.info({
        userId: user.userId,
        roleId: role.id,
        roleCode: role.code,
      }, 'Role fetched successfully');

      return NextResponse.json({
        success: true,
        data: role,
      });
    } catch (error) {
      logger.error({ error, userId: user.userId, roleId: params.id }, 'Error fetching role');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch role' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update role
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      if (!permissions.includes('roles:update') && !permissions.includes('roles:manage')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      const roleId = params.id;

      // Validate request body
      const body = await request.json();
      const validatedData = UpdateRoleSchema.parse(body);

      // Check if role exists and belongs to tenant
      const existingRole = await prisma.role.findFirst({
        where: {
          id: roleId,
          tenantId: user.tenantId,
        },
      });

      if (!existingRole) {
        return NextResponse.json(
          { success: false, error: 'Role not found' },
          { status: 404 }
        );
      }

      // Prevent modification of system roles
      if (existingRole.isSystem && validatedData.isActive === false) {
        return NextResponse.json(
          { success: false, error: 'Cannot deactivate system roles' },
          { status: 400 }
        );
      }

      // Update role and permissions in a transaction
      const updatedRole = await prisma.$transaction(async (tx) => {
        // Update role basic info
        const role = await tx.role.update({
          where: { id: roleId },
          data: {
            name: validatedData.name,
            description: validatedData.description,
            isActive: validatedData.isActive,
          },
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            isSystem: true,
            isActive: true,
          },
        });

        // Update permissions if provided
        if (validatedData.permissionIds !== undefined) {
          // Remove all existing permissions
          await tx.rolePermission.deleteMany({
            where: { roleId },
          });

          // Add new permissions
          if (validatedData.permissionIds.length > 0) {
            await tx.rolePermission.createMany({
              data: validatedData.permissionIds.map((permId) => ({
                roleId,
                permissionId: permId,
              })),
            });
          }
        }

        return role;
      });

      // Create audit log
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Role Management',
          details: `Updated role: ${updatedRole.code} (${updatedRole.name})`,
          ipAddress,
        },
      });

      logger.info({
        userId: user.userId,
        roleId: updatedRole.id,
        roleCode: updatedRole.code,
      }, 'Role updated successfully');

      return NextResponse.json({
        success: true,
        data: updatedRole,
        message: 'Role updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }

      logger.error({ error, userId: user.userId, roleId: params.id }, 'Error updating role');
      return NextResponse.json(
        { success: false, error: 'Failed to update role' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete role (soft delete by deactivation)
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      if (!permissions.includes('roles:delete') && !permissions.includes('roles:manage')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      const roleId = params.id;

      // Check if role exists and belongs to tenant
      const existingRole = await prisma.role.findFirst({
        where: {
          id: roleId,
          tenantId: user.tenantId,
        },
        select: {
          id: true,
          code: true,
          name: true,
          isSystem: true,
          _count: {
            select: {
              userRoles: true,
            },
          },
        },
      });

      if (!existingRole) {
        return NextResponse.json(
          { success: false, error: 'Role not found' },
          { status: 404 }
        );
      }

      // Prevent deletion of system roles
      if (existingRole.isSystem) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete system roles' },
          { status: 400 }
        );
      }

      // Prevent deletion if role has active users
      if (existingRole._count.userRoles > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot delete role with ${existingRole._count.userRoles} assigned user(s)`,
          },
          { status: 400 }
        );
      }

      // Soft delete by setting isActive to false
      await prisma.role.update({
        where: { id: roleId },
        data: { isActive: false },
      });

      // Create audit log
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'DELETE',
          module: 'Role Management',
          details: `Deactivated role: ${existingRole.code} (${existingRole.name})`,
          ipAddress,
        },
      });

      logger.info({
        userId: user.userId,
        roleId: existingRole.id,
        roleCode: existingRole.code,
      }, 'Role deactivated successfully');

      return NextResponse.json({
        success: true,
        message: 'Role deactivated successfully',
      });
    } catch (error) {
      logger.error({ error, userId: user.userId, roleId: params.id }, 'Error deleting role');
      return NextResponse.json(
        { success: false, error: 'Failed to delete role' },
        { status: 500 }
      );
    }
  }
);
