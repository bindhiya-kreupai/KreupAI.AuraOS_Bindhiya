import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { UpdateRoleSchema, validationErrorResponse } from '@/lib/validators';

// GET - Fetch single role by ID
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.ROLES, Action.READ, permissions);
      if (permissionError) return permissionError;

      const roleId = params.id;

      // Fetch role
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        select: {
          id: true,
          name: true,
          description: true,
          usersCount: true,
          status: true,
        },
      });

      if (!role) {
        return NextResponse.json(
          { success: false, error: 'Role not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: role,
      });
    } catch (error) {
      console.error('Error fetching role:', error);
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
      const permissionError = requirePermission(Resource.ROLES, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const roleId = params.id;

      // Validate request body
      const body = await request.json();
      const validatedData = UpdateRoleSchema.parse(body);

      // Check if role exists
      const existingRole = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!existingRole) {
        return NextResponse.json(
          { success: false, error: 'Role not found' },
          { status: 404 }
        );
      }

      // Check for name uniqueness if name is being updated
      if (validatedData.name && validatedData.name !== existingRole.name) {
        const nameExists = await prisma.role.findUnique({
          where: { name: validatedData.name },
        });

        if (nameExists) {
          return NextResponse.json(
            { success: false, error: 'Role name already in use' },
            { status: 400 }
          );
        }
      }

      // Update role
      const updatedRole = await prisma.role.update({
        where: { id: roleId },
        data: validatedData,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
        },
      });

      // Create audit log
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Role Management',
          details: `Updated role: ${updatedRole.name}`,
          ipAddress,
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedRole,
        message: 'Role updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }

      console.error('Error updating role:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update role' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete role
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.ROLES, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const roleId = params.id;

      // Check if role exists
      const existingRole = await prisma.role.findUnique({
        where: { id: roleId },
        select: { id: true, name: true, usersCount: true },
      });

      if (!existingRole) {
        return NextResponse.json(
          { success: false, error: 'Role not found' },
          { status: 404 }
        );
      }

      // Prevent deletion if role has users
      if (existingRole.usersCount > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot delete role with ${existingRole.usersCount} assigned user(s)`,
          },
          { status: 400 }
        );
      }

      // Soft delete by setting status to Inactive
      await prisma.role.update({
        where: { id: roleId },
        data: { status: 'Inactive' },
      });

      // Create audit log
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'DELETE',
          module: 'Role Management',
          details: `Deactivated role: ${existingRole.name}`,
          ipAddress,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Role deactivated successfully',
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete role' },
        { status: 500 }
      );
    }
  }
);
