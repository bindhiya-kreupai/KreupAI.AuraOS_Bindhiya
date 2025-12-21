import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission, requireTenantAccess } from '@/lib/auth';
import { UpdateUserSchema, validationErrorResponse } from '@/lib/validators';
import { userService } from '@/lib/services';
import { logger } from '@/lib/logger';

// GET - Fetch single user by ID
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.USERS, Action.READ, permissions);
      if (permissionError) return permissionError;

      const userId = params.id;

      // Use service layer
      const result = await userService.getUserById(userId);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 404 }
        );
      }

      // Validate tenant access
      const tenantError = requireTenantAccess(user.tenantId, result.data.tenantId);
      if (tenantError) return tenantError;

      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      logger.error('Error fetching user:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update user
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.USERS, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const userId = params.id;

      // Validate request body
      const body = await request.json();
      const validatedData = UpdateUserSchema.parse(body);

      // Check if user exists and validate tenant access first
      const existingResult = await userService.getUserById(userId);
      if (!existingResult.success) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      const tenantError = requireTenantAccess(user.tenantId, existingResult.data.tenantId);
      if (tenantError) return tenantError;

      // Extract IP address
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

      // Use service layer
      const result = await userService.updateUser(
        userId,
        validatedData,
        user.userId,
        ipAddress
      );

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'User updated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }

      logger.error('Error updating user:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete user
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: { params: { id: string } }) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.USERS, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const userId = params.id;

      // Check if user exists and validate tenant access first
      const existingResult = await userService.getUserById(userId);
      if (!existingResult.success) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      const tenantError = requireTenantAccess(user.tenantId, existingResult.data.tenantId);
      if (tenantError) return tenantError;

      // Prevent self-deletion
      if (userId === user.userId) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete your own account' },
          { status: 400 }
        );
      }

      // Extract IP address
      const ipAddress =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';

      // Use service layer
      const result = await userService.deleteUser(userId, user.userId, ipAddress);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 500 }
      );
    }
  }
);
