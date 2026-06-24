import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };

    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.startDate = dateFilter;
    }

    const requests = await prisma.workFromHomeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const employeeIds = [...new Set(requests.map((r) => r.employeeId))];
    const employees =
      employeeIds.length > 0
        ? await prisma.employee.findMany({
            where: { id: { in: employeeIds }, company: { tenantId: user.tenantId } },
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          })
        : [];
    const employeeMap = new Map(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));

    const data = requests.map((r) => ({
      id: r.id,
      requestCode: r.requestCode,
      employeeId: r.employeeId,
      employeeName: employeeMap.get(r.employeeId) || 'Unknown Employee',
      startDate: r.startDate.toISOString().split('T')[0],
      endDate: r.endDate.toISOString().split('T')[0],
      numberOfDays: Number(r.numberOfDays),
      reason: r.reason,
      status: r.status.toLowerCase(),
      submittedDate: r.submittedDate.toISOString(),
      approvedBy: r.approvedBy || undefined,
      approvedAt: r.approvedAt?.toISOString() || undefined,
      approvedDate: r.approvedAt?.toISOString() || undefined,
      rejectionReason: r.rejectionReason || undefined,
      requiresCheckIn: r.requiresCheckIn,
      checkInRequired: r.checkInRequired?.toISOString() || undefined,
      checkOutRequired: r.checkOutRequired?.toISOString() || undefined,
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: { total: data.length },
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch WFH requests');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch WFH requests' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions, employeeId }) => {
    try {
      const body = await request.json();

      if (body.action === 'approve') {
        return handleApprove(body, user);
      }
      if (body.action === 'reject') {
        return handleReject(body, user);
      }

      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      if (!body.startDate || !body.reason) {
        return NextResponse.json(
          { success: false, error: 'startDate and reason are required' },
          { status: 400 }
        );
      }

      const startDate = new Date(body.startDate);
      const endDate = body.endDate ? new Date(body.endDate) : startDate;

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return NextResponse.json({ success: false, error: 'Invalid date format' }, { status: 400 });
      }

      const diffMs = endDate.getTime() - startDate.getTime();
      const numberOfDays = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;

      const empId = body.employeeId || employeeId || '';
      if (!empId) {
        return NextResponse.json(
          { success: false, error: 'Employee ID is required' },
          { status: 400 }
        );
      }

      const id = crypto.randomUUID();
      const timestamp = Date.now();
      const requestCode = `WFH-${user.tenantId}-${timestamp}`;

      const created = await prisma.workFromHomeRequest.create({
        data: {
          id,
          requestCode,
          tenantId: user.tenantId,
          employeeId: empId,
          startDate,
          endDate,
          numberOfDays,
          reason: body.reason,
          status: 'PENDING',
          requiresCheckIn: false,
          createdBy: user.userId,
          updatedBy: user.userId,
        },
      });

      logger.info({ id, requestCode }, 'WFH request created');

      return NextResponse.json(
        {
          success: true,
          data: {
            id: created.id,
            requestCode: created.requestCode,
            employeeId: created.employeeId,
            startDate: created.startDate.toISOString().split('T')[0],
            endDate: created.endDate.toISOString().split('T')[0],
            numberOfDays: Number(created.numberOfDays),
            reason: created.reason,
            status: created.status.toLowerCase(),
            submittedDate: created.submittedDate.toISOString(),
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      logger.error({ error }, 'Failed to submit WFH request');
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to submit WFH request' },
        { status: 500 }
      );
    }
  }
);

async function handleApprove(body: any, user: { userId: string; tenantId: string }) {
  const { id } = body;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
  }

  try {
    const existing = await prisma.workFromHomeRequest.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'WFH request not found' }, { status: 404 });
    }

    if (existing.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `Cannot approve a request with status ${existing.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.workFromHomeRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.userId,
        approvedAt: new Date(),
        updatedBy: user.userId,
      },
    });

    logger.info({ id }, 'WFH request approved');

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status.toLowerCase(),
        approvedBy: updated.approvedBy,
        approvedAt: updated.approvedAt?.toISOString(),
      },
    });
  } catch (error: any) {
    logger.error({ error, id }, 'Failed to approve WFH request');
    return NextResponse.json(
      { success: false, error: 'Failed to approve WFH request' },
      { status: 500 }
    );
  }
}

async function handleReject(body: any, user: { userId: string; tenantId: string }) {
  const { id, reason } = body;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
  }

  if (!reason) {
    return NextResponse.json(
      { success: false, error: 'Rejection reason is required' },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.workFromHomeRequest.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'WFH request not found' }, { status: 404 });
    }

    if (existing.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `Cannot reject a request with status ${existing.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.workFromHomeRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        approvedBy: user.userId,
        approvedAt: new Date(),
        updatedBy: user.userId,
      },
    });

    logger.info({ id }, 'WFH request rejected');

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status.toLowerCase(),
        rejectionReason: updated.rejectionReason,
      },
    });
  } catch (error: any) {
    logger.error({ error, id }, 'Failed to reject WFH request');
    return NextResponse.json(
      { success: false, error: 'Failed to reject WFH request' },
      { status: 500 }
    );
  }
}
