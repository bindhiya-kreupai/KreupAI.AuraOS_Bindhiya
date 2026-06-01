import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/leaves/[id]/reject
 * Reject a leave request
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

    if (!['PENDING', 'APPROVED'].includes(leaveRequest.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: `Cannot reject leave request with status: ${leaveRequest.status}`,
          },
        },
        { status: 422 }
      );
    }

    if (!body.reason) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Rejection reason is required' } },
        { status: 400 }
      );
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy: user.id,
        rejectedAt: new Date(),
        rejectionReason: body.reason,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        leaveType: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Leave request rejected',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Leaves Reject API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to reject leave request' } },
      { status: 500 }
    );
  }
});
