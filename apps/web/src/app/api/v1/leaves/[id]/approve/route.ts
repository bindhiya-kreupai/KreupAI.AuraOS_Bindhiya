import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/leaves/[id]/approve
 * Approve a leave request
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('leaves:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leaves:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;
    const body = await request.json().catch(() => ({}));

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Leave request not found' } },
        { status: 404 }
      );
    }

    if (leaveRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: `Cannot approve leave request with status: ${leaveRequest.status}`,
          },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date(),
        approverComment: body.comment || null,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        leaveType: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Leave request approved successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Leaves Approve API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to approve leave request' } },
      { status: 500 }
    );
  }
});
