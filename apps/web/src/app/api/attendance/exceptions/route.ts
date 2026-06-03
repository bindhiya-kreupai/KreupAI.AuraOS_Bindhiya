import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch attendance exceptions
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    // Build where clause - only fetch records that have exceptions
    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
      OR: [{ isLate: true }, { isEarlyOut: true }, { status: 'ABSENT' }, { status: 'HALF_DAY' }],
    };

    if (date) {
      where.date = new Date(date);
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    // Filter by exception type
    if (type) {
      delete where.OR;
      switch (type) {
        case 'LATE_ARRIVAL':
          where.isLate = true;
          break;
        case 'EARLY_DEPARTURE':
          where.isEarlyOut = true;
          break;
        case 'MISSING_PUNCH':
          // Records with clock-in but no clock-out or vice versa
          where.OR = [
            { clockIn: { not: null }, clockOut: null, status: { not: 'ABSENT' } },
            { clockIn: null, clockOut: { not: null }, status: { not: 'ABSENT' } },
          ];
          break;
        case 'SHORT_DURATION':
          where.status = 'HALF_DAY';
          break;
        case 'ABSENT':
          where.status = 'ABSENT';
          break;
      }
    }

    if (status) {
      where.approvalStatus = status;
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Look up employee names
    const employeeIds = Array.from(new Set(records.map((r) => r.employeeId)));
    const employees =
      employeeIds.length > 0
        ? await prisma.employee.findMany({
            where: { id: { in: employeeIds }, company: { tenantId: user.tenantId } },
            select: { id: true, firstName: true, lastName: true },
          })
        : [];
    const employeeMap = new Map(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));

    // Map records to exception format
    const exceptions = records.map((record) => {
      let exceptionType = 'ABSENT';
      if (record.isLate) exceptionType = 'LATE_ARRIVAL';
      else if (record.isEarlyOut) exceptionType = 'EARLY_DEPARTURE';
      else if (record.status === 'HALF_DAY') exceptionType = 'SHORT_DURATION';
      else if ((record.clockIn && !record.clockOut) || (!record.clockIn && record.clockOut))
        exceptionType = 'MISSING_PUNCH';

      return {
        id: record.id,
        employeeId: record.employeeId,
        employeeName: employeeMap.get(record.employeeId) || 'Unknown Employee',
        date: record.date.toISOString().split('T')[0],
        type: exceptionType,
        checkIn: record.clockIn ? record.clockIn.toISOString() : null,
        checkOut: record.clockOut ? record.clockOut.toISOString() : null,
        workHours: record.workHours,
        status: record.approvalStatus,
        isRegularized: record.isRegularized,
        remarks: record.remarks,
        createdAt: record.createdAt.toISOString(),
      };
    });

    const summary = {
      total: exceptions.length,
      pending: exceptions.filter((e) => e.status === 'PENDING').length,
      approved: exceptions.filter((e) => e.status === 'APPROVED').length,
      rejected: exceptions.filter((e) => e.status === 'REJECTED').length,
      byType: {
        lateArrival: exceptions.filter((e) => e.type === 'LATE_ARRIVAL').length,
        earlyDeparture: exceptions.filter((e) => e.type === 'EARLY_DEPARTURE').length,
        missingPunch: exceptions.filter((e) => e.type === 'MISSING_PUNCH').length,
        shortDuration: exceptions.filter((e) => e.type === 'SHORT_DURATION').length,
        absent: exceptions.filter((e) => e.type === 'ABSENT').length,
      },
    };

    return NextResponse.json({
      success: true,
      data: { exceptions, summary },
    });
  } catch (error: any) {
    logger.error({ error }, 'Error fetching exceptions:');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exceptions' },
      { status: 500 }
    );
  }
});

// POST - Resolve attendance exceptions
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { id, action, remarks } = body as {
      id?: string;
      action?: 'regularize' | 'deduct';
      remarks?: string;
    };

    if (!id || !action || !['regularize', 'deduct'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'id and a valid action are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.attendanceRecord.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Attendance exception not found' },
        { status: 404 }
      );
    }

    // tenant-ok: id-based update preceded by tenant-scoped findFirst above
    const updated = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        approvalStatus: action === 'regularize' ? 'APPROVED' : 'REJECTED',
        isRegularized: action === 'regularize',
        remarks:
          remarks ||
          (action === 'regularize'
            ? 'Regularized from attendance exceptions dashboard'
            : 'Marked for leave deduction from attendance exceptions dashboard'),
      },
    });

    const employee = await prisma.employee.findFirst({
      where: { id: updated.employeeId, company: { tenantId: user.tenantId } },
      select: { firstName: true, lastName: true },
    });

    let exceptionType = 'ABSENT';
    if (updated.isLate) exceptionType = 'LATE_ARRIVAL';
    else if (updated.isEarlyOut) exceptionType = 'EARLY_DEPARTURE';
    else if (updated.status === 'HALF_DAY') exceptionType = 'SHORT_DURATION';
    else if ((updated.clockIn && !updated.clockOut) || (!updated.clockIn && updated.clockOut)) {
      exceptionType = 'MISSING_PUNCH';
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        employeeId: updated.employeeId,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee',
        date: updated.date.toISOString().split('T')[0],
        type: exceptionType,
        checkIn: updated.clockIn ? updated.clockIn.toISOString() : null,
        checkOut: updated.clockOut ? updated.clockOut.toISOString() : null,
        workHours: updated.workHours,
        status: updated.approvalStatus,
        isRegularized: updated.isRegularized,
        remarks: updated.remarks,
      },
    });
  } catch (error: any) {
    logger.error({ error }, 'Error resolving exceptions:');
    return NextResponse.json(
      { success: false, error: 'Failed to resolve attendance exception' },
      { status: 500 }
    );
  }
});
