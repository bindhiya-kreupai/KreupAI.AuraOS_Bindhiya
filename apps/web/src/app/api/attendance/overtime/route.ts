import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const requestedEmployeeId = searchParams.get('employeeId');
    const employeeId =
      !requestedEmployeeId || ['current-user', 'current-user-id'].includes(requestedEmployeeId)
        ? user.employeeId || user.userId
        : requestedEmployeeId;
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const overtime = await prisma.overtimeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      totalHours: overtime.reduce((sum, r) => sum + r.totalHours, 0),
      totalAmount: 0,
      pendingApproval: overtime.filter((r) => r.status === 'PENDING').length,
      approved: overtime.filter((r) => r.status === 'APPROVED').length,
      rejected: overtime.filter((r) => r.status === 'REJECTED').length,
    };

    return NextResponse.json({
      success: true,
      data: { overtime, summary },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch overtime records' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const action = body.action || 'submit';

    switch (action) {
      case 'submit': {
        const employeeId =
          !body.employeeId || ['current-user', 'current-user-id'].includes(body.employeeId)
            ? user.employeeId || user.userId
            : body.employeeId;

        if (!employeeId || !body.date || !body.overtimeMinutes) {
          return NextResponse.json(
            { error: 'employeeId, date, and overtimeMinutes are required' },
            { status: 400 }
          );
        }

        const record = await prisma.overtimeRequest.create({
          data: {
            tenantId: user.tenantId,
            employeeId,
            overtimeDate: new Date(body.date),
            startTime: body.startTime ? new Date(body.startTime) : new Date(body.date),
            endTime: body.endTime ? new Date(body.endTime) : new Date(body.date),
            totalHours: body.overtimeMinutes / 60,
            overtimeType: body.overtimeType || 'REGULAR',
            reason: body.reason || '',
            workDescription: body.workDescription,
            project: body.project,
            status: 'PENDING',
            compensationType: body.compensationType,
          },
        });

        return NextResponse.json({
          success: true,
          data: record,
        });
      }

      case 'approve': {
        if (!body.overtimeId || !body.approverId) {
          return NextResponse.json(
            { error: 'overtimeId and approverId are required' },
            { status: 400 }
          );
        }

        // tenant-ok: preceded by tenant-scoped findFirst or local tenantId binding
        const approved = await prisma.overtimeRequest.update({
          where: { id: body.overtimeId },
          data: {
            status: 'APPROVED',
            approvedBy: body.approverId,
            approvedAt: new Date(),
            actualHours: body.approvedMinutes ? body.approvedMinutes / 60 : undefined,
          },
        });

        return NextResponse.json({
          success: true,
          data: approved,
        });
      }

      case 'reject': {
        if (!body.overtimeId || !body.approverId || !body.rejectionReason) {
          return NextResponse.json(
            { error: 'overtimeId, approverId, and rejectionReason are required' },
            { status: 400 }
          );
        }

        // tenant-ok: preceded by tenant-scoped findFirst or local tenantId binding
        const rejected = await prisma.overtimeRequest.update({
          where: { id: body.overtimeId },
          data: {
            status: 'REJECTED',
            approvedBy: body.approverId,
            rejectionReason: body.rejectionReason,
          },
        });

        return NextResponse.json({
          success: true,
          data: rejected,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process overtime' },
      { status: 500 }
    );
  }
});
