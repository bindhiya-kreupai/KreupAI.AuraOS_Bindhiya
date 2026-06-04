import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  DeactivateUserSchema,
  UserDeactivationQuerySchema,
  validationErrorResponse,
  validateQueryParams,
} from '@/lib/validators';

// GET - Fetch user deactivation records with filters
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.USERS, Action.READ, permissions);
    if (permissionError) return permissionError;

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const { userId, deactivatedBy, page, limit } = validateQueryParams(
      UserDeactivationQuerySchema,
      searchParams
    );

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (deactivatedBy) {
      where.deactivatedBy = deactivatedBy;
    }

    // Execute query
    const [deactivations, total] = await Promise.all([
      prisma.userDeactivation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { deactivatedAt: 'desc' },
      }),
      prisma.userDeactivation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: deactivations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error fetching user deactivations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user deactivations' },
      { status: 500 }
    );
  }
});

// POST - Deactivate a user
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.USERS, Action.DELETE, permissions);
    if (permissionError) return permissionError;

    // Validate request body
    const body = await request.json();
    const validatedData = DeactivateUserSchema.parse(body);

    // Fetch the user to deactivate
    // tenant-ok: id from authenticated JWT or tenant-scoped lookup above
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { id: true, email: true, status: true, tenantId: true },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Prevent self-deactivation
    if (targetUser.id === user.userId) {
      return NextResponse.json(
        { success: false, error: 'You cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Check if user is already inactive
    if (targetUser.status === 'Inactive') {
      return NextResponse.json(
        { success: false, error: 'User is already deactivated' },
        { status: 400 }
      );
    }

    // Tenant isolation check
    if (targetUser.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Cannot deactivate users from other tenants' },
        { status: 403 }
      );
    }

    // Begin transaction - deactivate user and create deactivation record
    const [updatedUser, deactivationRecord] = await prisma.$transaction([
      // Update user status to Inactive
      // tenant-ok: targetUser.tenantId equality was verified directly above
      prisma.user.update({
        where: { id: validatedData.userId },
        data: { status: 'Inactive' },
      }),

      // Create deactivation record
      prisma.userDeactivation.create({
        data: {
          userId: validatedData.userId,
          reason: validatedData.reason,
          deactivatedBy: user.userId,
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),

      // Revoke all active sessions
      prisma.userSession.updateMany({
        where: {
          userId: validatedData.userId,
          status: 'Active',
        },
        data: { status: 'Revoked' },
      }),
    ]);

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'DELETE',
        resourceType: 'User Management',
        metadata: {
          description: `Deactivated user: ${targetUser.email}. Reason: ${validatedData.reason}`,
        } as any,
        ipAddress,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User deactivated successfully',
        data: deactivationRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error deactivating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deactivate user' },
      { status: 500 }
    );
  }
});
