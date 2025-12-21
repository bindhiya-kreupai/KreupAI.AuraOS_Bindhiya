import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth/enhanced-middleware';
import { logger } from '@/lib/logger';

/**
 * User Role Assignment API - Database-Backed RBAC Implementation
 * Handles assigning and removing roles from users
 */

// Validation Schemas
const AssignRoleSchema = z.object({
  roleId: z.string().uuid(),
  expiresAt: z.string().datetime().optional(), // ISO 8601 datetime string
});

const RemoveRoleSchema = z.object({
  roleId: z.string().uuid(),
});

// GET - Fetch all roles assigned to a user
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      if (!permissions.includes('users:read') && !permissions.includes('users:manage')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      const userId = params.id;

      // Verify user exists and belongs to tenant
      const targetUser = await prisma.user.findFirst({
        where: {
          id: userId,
          tenantId: user.tenantId,
        },
      });

      if (!targetUser) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Fetch user roles with full details
      const userRoles = await prisma.userRole.findMany({
        where: {
          userId,
          tenantId: user.tenantId,
        },
        select: {
          id: true,
          roleId: true,
          assignedBy: true,
          assignedAt: true,
          expiresAt: true,
          role: {
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
              isSystem: true,
              isActive: true,
            },
          },
        },
        orderBy: { assignedAt: 'desc' },
      });

      logger.info({
        userId: user.userId,
        targetUserId: userId,
        rolesCount: userRoles.length,
      }, 'User roles fetched successfully');

      return NextResponse.json({
        success: true,
        data: userRoles,
      });
    } catch (error) {
      logger.error({ error, userId: user.userId, targetUserId: params.id }, 'Error fetching user roles');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user roles' },
        { status: 500 }
      );
    }
  }
);

// POST - Assign a role to a user
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      if (!permissions.includes('users:update') && !permissions.includes('users:manage')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      const userId = params.id;

      // Validate request body
      const body = await request.json();
      const validatedData = AssignRoleSchema.parse(body);

      // Verify user exists and belongs to tenant
      const targetUser = await prisma.user.findFirst({
        where: {
          id: userId,
          tenantId: user.tenantId,
        },
      });

      if (!targetUser) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Verify role exists and belongs to tenant
      const role = await prisma.role.findFirst({
        where: {
          id: validatedData.roleId,
          tenantId: user.tenantId,
          isActive: true,
        },
      });

      if (!role) {
        return NextResponse.json(
          { success: false, error: 'Role not found or inactive' },
          { status: 404 }
        );
      }

      // Check if user already has this role
      const existingAssignment = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId: validatedData.roleId,
          },
        },
      });

      if (existingAssignment) {
        return NextResponse.json(
          { success: false, error: 'User already has this role assigned' },
          { status: 400 }
        );
      }

      // Assign role to user
      const userRole = await prisma.userRole.create({
        data: {
          userId,
          roleId: validatedData.roleId,
          tenantId: user.tenantId,
          assignedBy: user.userId,
          expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        },
        select: {
          id: true,
          roleId: true,
          assignedBy: true,
          assignedAt: true,
          expiresAt: true,
          role: {
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
            },
          },
        },
      });

      // Create audit log
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'User Role Assignment',
          details: `Assigned role ${role.code} (${role.name}) to user ${targetUser.email}${validatedData.expiresAt ? ` (expires: ${validatedData.expiresAt})` : ''}`,
          ipAddress,
        },
      });

      logger.info({
        userId: user.userId,
        targetUserId: userId,
        roleId: role.id,
        roleCode: role.code,
        expiresAt: validatedData.expiresAt,
      }, 'Role assigned to user successfully');

      return NextResponse.json(
        {
          success: true,
          data: userRole,
          message: 'Role assigned successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }

      logger.error({ error, userId: user.userId, targetUserId: params.id }, 'Error assigning role to user');
      return NextResponse.json(
        { success: false, error: 'Failed to assign role' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Remove a role from a user
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      if (!permissions.includes('users:update') && !permissions.includes('users:manage')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      const userId = params.id;

      // Validate request body
      const body = await request.json();
      const validatedData = RemoveRoleSchema.parse(body);

      // Verify user exists and belongs to tenant
      const targetUser = await prisma.user.findFirst({
        where: {
          id: userId,
          tenantId: user.tenantId,
        },
      });

      if (!targetUser) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Verify role assignment exists
      const userRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId: validatedData.roleId,
          },
        },
        include: {
          role: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      if (!userRole) {
        return NextResponse.json(
          { success: false, error: 'Role assignment not found' },
          { status: 404 }
        );
      }

      // Prevent removing the last role if it's a system role
      const userRolesCount = await prisma.userRole.count({
        where: { userId },
      });

      if (userRolesCount === 1 && userRole.role.code === 'EMPLOYEE') {
        return NextResponse.json(
          { success: false, error: 'Cannot remove the last role from user' },
          { status: 400 }
        );
      }

      // Remove role assignment
      await prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId: validatedData.roleId,
          },
        },
      });

      // Create audit log
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'DELETE',
          module: 'User Role Assignment',
          details: `Removed role ${userRole.role.code} (${userRole.role.name}) from user ${targetUser.email}`,
          ipAddress,
        },
      });

      logger.info({
        userId: user.userId,
        targetUserId: userId,
        roleId: validatedData.roleId,
        roleCode: userRole.role.code,
      }, 'Role removed from user successfully');

      return NextResponse.json({
        success: true,
        message: 'Role removed successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }

      logger.error({ error, userId: user.userId, targetUserId: params.id }, 'Error removing role from user');
      return NextResponse.json(
        { success: false, error: 'Failed to remove role' },
        { status: 500 }
      );
    }
  }
);
