import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  CreateUserDelegationSchema,
  UserDelegationQuerySchema,
  validationErrorResponse,
  validateQueryParams,
} from '@/lib/validators';

// GET - Fetch user delegations with filters
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.USERS, Action.READ, permissions);
    if (permissionError) return permissionError;

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const { delegatorId, delegateeId, status, page, limit } = validateQueryParams(
      UserDelegationQuerySchema,
      searchParams
    );

    // Build where clause
    const where: any = {};

    if (delegatorId) {
      where.delegatorId = delegatorId;
    }

    if (delegateeId) {
      where.delegateeId = delegateeId;
    }

    if (status) {
      where.status = status;
    }

    // Execute query
    const [delegations, total] = await Promise.all([
      prisma.userDelegation.findMany({
        where,
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
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userDelegation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: delegations,
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

    logger.error('Error fetching user delegations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user delegations' },
      { status: 500 }
    );
  }
});

// POST - Create new user delegation
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission
    const permissionError = requirePermission(Resource.USERS, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    // Validate request body
    const body = await request.json();
    const validatedData = CreateUserDelegationSchema.parse(body);

    // Fetch both delegator and delegatee
    const [delegator, delegatee] = await Promise.all([
      prisma.user.findUnique({
        where: { id: validatedData.delegatorId },
        select: { id: true, email: true, tenantId: true, status: true },
      }),
      prisma.user.findUnique({
        where: { id: validatedData.delegateeId },
        select: { id: true, email: true, tenantId: true, status: true },
      }),
    ]);

    if (!delegator) {
      return NextResponse.json(
        { success: false, error: 'Delegator user not found' },
        { status: 404 }
      );
    }

    if (!delegatee) {
      return NextResponse.json(
        { success: false, error: 'Delegatee user not found' },
        { status: 404 }
      );
    }

    // Prevent self-delegation
    if (delegator.id === delegatee.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delegate to yourself' },
        { status: 400 }
      );
    }

    // Check both users are active
    if (delegator.status !== 'Active' || delegatee.status !== 'Active') {
      return NextResponse.json(
        { success: false, error: 'Both users must be active for delegation' },
        { status: 400 }
      );
    }

    // Tenant isolation check
    if (delegator.tenantId !== user.tenantId || delegatee.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Cannot create delegation across different tenants' },
        { status: 403 }
      );
    }

    // Check for overlapping delegations
    const overlappingDelegation = await prisma.userDelegation.findFirst({
      where: {
        delegatorId: validatedData.delegatorId,
        delegateeId: validatedData.delegateeId,
        status: {
          in: ['Active', 'Scheduled'],
        },
        OR: [
          {
            startDate: {
              lte: new Date(validatedData.endDate),
            },
            endDate: {
              gte: new Date(validatedData.startDate),
            },
          },
        ],
      },
    });

    if (overlappingDelegation) {
      return NextResponse.json(
        {
          success: false,
          error: 'An overlapping delegation already exists for these users',
        },
        { status: 400 }
      );
    }

    // Create new delegation
    const newDelegation = await prisma.userDelegation.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
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

    // Create audit log
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'CREATE',
        resourceType: 'User Delegation',
        metadata: { description: `Created delegation from ${delegator.email} to ${delegatee.email} for role: ${validatedData.role}` } as any,
        ipAddress,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User delegation created successfully',
        data: newDelegation,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Error creating user delegation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user delegation' },
      { status: 500 }
    );
  }
});
