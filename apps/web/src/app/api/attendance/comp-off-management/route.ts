import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch comp-off management data (for managers/HR)
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = { tenantId: user.tenantId };

    if (status) {
      where.status = status;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.earnedDate = dateFilter;
    }

    const compOffs = await prisma.compOffRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Look up employee names and departments
    const employeeIds = Array.from(new Set(compOffs.map((c) => c.employeeId)));
    const employees =
      employeeIds.length > 0
        ? await prisma.employee.findMany({
            where: { id: { in: employeeIds }, company: { tenantId: user.tenantId } },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: { select: { name: true } },
            },
          })
        : [];
    const employeeMap = new Map(
      employees.map((e) => [
        e.id,
        {
          name: `${e.firstName} ${e.lastName}`,
          department: e.department?.name || 'Unknown',
        },
      ])
    );

    const data = compOffs.map((c) => {
      const emp = employeeMap.get(c.employeeId);
      return {
        id: c.id,
        employeeId: c.employeeId,
        employeeName: emp?.name || 'Unknown Employee',
        department: emp?.department || 'Unknown',
        earnedDate: c.earnedDate.toISOString().split('T')[0],
        earnedHours: c.earnedHours,
        status: c.status,
        appliedDate: c.appliedDate ? c.appliedDate.toISOString().split('T')[0] : null,
        expiryDate: c.expiryDate.toISOString().split('T')[0],
        approvedBy: c.approvedBy,
        approvedAt: c.approvedAt ? c.approvedAt.toISOString() : null,
        rejectionReason: c.rejectionReason,
        remarks: c.remarks,
        createdAt: c.createdAt.toISOString(),
      };
    });

    const summary = {
      total: data.length,
      pending: data.filter((c) => c.status === 'PENDING' || c.status === 'APPLIED').length,
      approved: data.filter((c) => c.status === 'APPROVED' || c.status === 'AVAILED').length,
      rejected: data.filter((c) => c.status === 'CANCELLED').length,
      earned: data.filter((c) => c.status === 'EARNED').length,
      expired: data.filter((c) => c.status === 'EXPIRED').length,
      byDepartment: Object.entries(
        data.reduce(
          (acc, c) => {
            acc[c.department] = (acc[c.department] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      ).map(([department, count]) => ({ department, count })),
    };

    return NextResponse.json({
      success: true,
      data: { compOffs: data, summary },
      meta: { total: data.length },
    });
  } catch (error: any) {
    logger.error({ error }, 'Error fetching comp-off management data:');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comp-off management data' },
      { status: 500 }
    );
  }
});

// POST - Request / approve / reject comp-off management actions
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const body = await request.json();
    const action = body.action || 'request';
    const requiredAction = action === 'request' ? Action.CREATE : Action.UPDATE;
    const permissionError = requirePermission(Resource.ATTENDANCE, requiredAction, permissions);
    if (permissionError) return permissionError;

    if (action === 'request') {
      const employeeId =
        !body.employeeId || ['current-user', 'current-user-id'].includes(body.employeeId)
          ? user.employeeId || user.userId
          : body.employeeId;

      if (!employeeId || !body.date || !body.hours) {
        return NextResponse.json(
          { success: false, error: 'employeeId, date, and hours are required' },
          { status: 400 }
        );
      }

      const expiryDate = new Date(body.date);
      expiryDate.setDate(expiryDate.getDate() + 60);

      const created = await prisma.compOffRequest.create({
        data: {
          tenantId: user.tenantId,
          employeeId,
          earnedDate: new Date(body.date),
          earnedHours: Number(body.hours),
          status: 'PENDING',
          expiryDate,
          remarks: body.reason || null,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            id: created.id,
            employeeId: created.employeeId,
            earnedDate: created.earnedDate.toISOString().split('T')[0],
            earnedHours: created.earnedHours,
            status: created.status,
            expiryDate: created.expiryDate.toISOString().split('T')[0],
            remarks: created.remarks,
            createdAt: created.createdAt.toISOString(),
          },
        },
        { status: 201 }
      );
    }

    if (!body.id || !body.approverId) {
      return NextResponse.json(
        { success: false, error: 'id and approverId are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.compOffRequest.findFirst({
      where: { id: body.id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Comp-off record not found' },
        { status: 404 }
      );
    }

    // tenant-ok: id-based op preceded by tenant-scoped findFirst above
    const updated = await prisma.compOffRequest.update({
      where: { id: body.id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'CANCELLED',
        approvedBy: body.approverId,
        approvedAt: new Date(),
        rejectionReason: action === 'reject' ? body.reason || 'Rejected' : null,
        remarks: body.comments || body.reason || existing.remarks,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        employeeId: updated.employeeId,
        earnedDate: updated.earnedDate.toISOString().split('T')[0],
        earnedHours: updated.earnedHours,
        status: updated.status,
        appliedDate: updated.appliedDate ? updated.appliedDate.toISOString().split('T')[0] : null,
        expiryDate: updated.expiryDate.toISOString().split('T')[0],
        approvedBy: updated.approvedBy,
        approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : null,
        rejectionReason: updated.rejectionReason,
        remarks: updated.remarks,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    logger.error({ error }, 'Error updating comp-off management data:');
    return NextResponse.json(
      { success: false, error: 'Failed to update comp-off management data' },
      { status: 500 }
    );
  }
});
