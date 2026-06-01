import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/leaves/[id]
 * Get a single leave request by ID
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('leaves:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leaves:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        leaveType: { select: { id: true, name: true, code: true } },
      },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Leave request not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: leaveRequest,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Leaves API] GET/:id Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch leave request' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/leaves/[id]
 * Update a leave request
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('leaves:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leaves:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;
    const body = await request.json();

    const existing = await prisma.leaveRequest.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Leave request not found' } },
        { status: 404 }
      );
    }

    if (existing.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4003', message: 'Only pending leave requests can be updated' },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        leaveTypeId: body.leaveTypeId,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        totalDays: body.totalDays,
        reason: body.reason,
        updatedAt: new Date(),
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        leaveType: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Leaves API] PUT/:id Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update leave request' } },
      { status: 500 }
    );
  }
});
