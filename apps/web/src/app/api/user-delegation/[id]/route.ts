import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { UpdateUserDelegationSchema, validationErrorResponse } from '@/lib/validators';
import { logger } from '@/lib/logger';

// GET - Fetch single user delegation by ID
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: any) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.USERS, Action.READ, permissions);
      if (permissionError) return permissionError;

      const delegationId = params.id;

      // Fetch delegation
      const delegation = await prisma.userDelegation.findUnique({
        where: { id: delegationId },
        include: {
          delegator: {
            select: {
              id: true,
              email: true,
            },
          },
          delegatee: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (!delegation) {
        return NextResponse.json(
          { success: false, error: 'User delegation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: delegation,
      });
    } catch (error: any) {
      logger.error('Error fetching user delegation:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user delegation' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update user delegation
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: any) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.USERS, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const delegationId = params.id;

      // Validate request body
      const body = await request.json();
      const validatedData = UpdateUserDelegationSchema.parse(body);

      // Fetch existing delegation
      const existingDelegation = await prisma.userDelegation.findUnique({
        where: { id: delegationId },
        include: {
          delegator: {
            select: {
              email: true,
            },
          },
          delegatee: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!existingDelegation) {
        return NextResponse.json(
          { success: false, error: 'User delegation not found' },
          { status: 404 }
        );
      }

      // Prepare update data
      const updateData: any = {};

      if (validatedData.role !== undefined) {
        updateData.role = validatedData.role;
      }

      if (validatedData.startDate !== undefined) {
        updateData.startDate = new Date(validatedData.startDate);
      }

      if (validatedData.endDate !== undefined) {
        updateData.endDate = new Date(validatedData.endDate);
      }

      if (validatedData.reason !== undefined) {
        updateData.reason = validatedData.reason;
      }

      if (validatedData.status !== undefined) {
        updateData.status = validatedData.status;
      }

      // Validate date range if dates are being updated
      const newStartDate = updateData.startDate || existingDelegation.startDate;
      const newEndDate = updateData.endDate || existingDelegation.endDate;

      if (newEndDate <= newStartDate) {
        return NextResponse.json(
          { success: false, error: 'End date must be after start date' },
          { status: 400 }
        );
      }

      // Update delegation
      const updatedDelegation = await prisma.userDelegation.update({
        where: { id: delegationId },
        data: updateData,
        include: {
          delegator: {
            select: {
              email: true,
            },
          },
          delegatee: {
            select: {
              email: true,
            },
          },
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
          module: 'User Delegation',
          details: `Updated delegation from ${updatedDelegation.delegator.email} to ${updatedDelegation.delegatee.email}`,
          ipAddress,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User delegation updated successfully',
        data: updatedDelegation,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }

      logger.error('Error updating user delegation:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update user delegation' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete user delegation
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, params }: any) => {
    try {
      // Check permission
      const permissionError = requirePermission(Resource.USERS, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const delegationId = params.id;

      // Fetch existing delegation
      const existingDelegation = await prisma.userDelegation.findUnique({
        where: { id: delegationId },
        include: {
          delegator: {
            select: {
              email: true,
            },
          },
          delegatee: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!existingDelegation) {
        return NextResponse.json(
          { success: false, error: 'User delegation not found' },
          { status: 404 }
        );
      }

      // Delete delegation (hard delete is acceptable for delegations)
      await prisma.userDelegation.delete({
        where: { id: delegationId },
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
          module: 'User Delegation',
          details: `Deleted delegation from ${existingDelegation.delegator.email} to ${existingDelegation.delegatee.email}`,
          ipAddress,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User delegation deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting user delegation:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete user delegation' },
        { status: 500 }
      );
    }
  }
);
