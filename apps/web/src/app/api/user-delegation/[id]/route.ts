import type { NextRequest } from 'next/server';
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

      // Fetch delegation — scoped to tenant, exclude soft-deleted
      const delegation = await prisma.userDelegation.findFirst({
        where: {
          id: delegationId,
          isDeleted: false,
          OR: [
            { delegator: { tenantId: user.tenantId } },
            { delegatee: { tenantId: user.tenantId } },
          ],
        },
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

      // Fetch existing delegation — scoped to tenant, exclude soft-deleted
      const existingDelegation = await prisma.userDelegation.findFirst({
        where: {
          id: delegationId,
          isDeleted: false,
          OR: [
            { delegator: { tenantId: user.tenantId } },
            { delegatee: { tenantId: user.tenantId } },
          ],
        },
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
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'UPDATE',
          module: 'User Delegation',
          resourceType: 'User Delegation',
          metadata: {
            description: `Updated delegation from ${updatedDelegation.delegator.email} to ${updatedDelegation.delegatee.email}`,
          } as any,
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

      // Fetch existing delegation — scoped to tenant, exclude soft-deleted
      const existingDelegation = await prisma.userDelegation.findFirst({
        where: {
          id: delegationId,
          isDeleted: false,
          OR: [
            { delegator: { tenantId: user.tenantId } },
            { delegatee: { tenantId: user.tenantId } },
          ],
        },
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

      // Soft-delete delegation (consistent with manager API)
      await prisma.userDelegation.update({
        where: { id: delegationId },
        data: {
          status: 'Revoked',
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: user.userId,
        },
      });

      // Create audit log
      const ipAddress =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'DELETE',
          module: 'User Delegation',
          resourceType: 'User Delegation',
          metadata: {
            description: `Deleted delegation from ${existingDelegation.delegator.email} to ${existingDelegation.delegatee.email}`,
          } as any,
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
