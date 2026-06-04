import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/shifts/roster
 * Get shift roster showing who is working which shift on which days
 *
 * Query Parameters:
 * - companyId (required): Company ID
 * - departmentId (optional): Filter by department
 * - startDate (required): Start date in YYYY-MM-DD format
 * - endDate (required): End date in YYYY-MM-DD format
 * - shiftId (optional): Filter by specific shift
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('shifts:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing shifts:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const departmentId = searchParams.get('departmentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const shiftId = searchParams.get('shiftId');

    if (!companyId || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'companyId, startDate, and endDate are required in query parameters',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Invalid date format. Use YYYY-MM-DD',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get employees matching company/department filter for this tenant
    const employeeFilter: Record<string, unknown> = {
      companyId,
      company: { tenantId: user.tenantId },
    };
    if (departmentId) {
      employeeFilter.departmentId = departmentId;
    }

    // tenant-ok: employee where clause is preceded by tenant-scoped lookup; relation traversal
    const employees = await prisma.employee.findMany({
      where: employeeFilter,
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        department: { select: { name: true } },
      },
    });

    const employeeIds = employees.map((e) => e.id);
    const employeeMap = new Map(employees.map((e) => [e.id, e]));

    // Build roster query filter
    const rosterWhere: Record<string, unknown> = {
      tenantId: user.tenantId,
      employeeId: { in: employeeIds },
      rosterDate: {
        gte: start,
        lte: end,
      },
    };
    if (shiftId) {
      rosterWhere.shiftId = shiftId;
    }

    // Fetch roster entries with shift details
    // tenant-ok: preceded by tenant-scoped findFirst or local tenantId binding
    const rosterEntries = await prisma.shiftRoster.findMany({
      where: rosterWhere,
      include: {
        shift: {
          select: {
            id: true,
            code: true,
            name: true,
            startTime: true,
            endTime: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ rosterDate: 'asc' }, { shiftId: 'asc' }],
    });

    // Get unique shifts used in the roster
    const shiftsMap = new Map<
      string,
      { id: string; code: string; name: string; startTime: string; endTime: string }
    >();
    for (const entry of rosterEntries) {
      if (!shiftsMap.has(entry.shiftId)) {
        shiftsMap.set(entry.shiftId, {
          id: entry.shift.id,
          code: entry.shift.code,
          name: entry.shift.name,
          startTime: entry.shift.startTime,
          endTime: entry.shift.endTime,
        });
      }
    }

    // Group roster entries by date, then by shift
    const dateGroups = new Map<string, typeof rosterEntries>();
    for (const entry of rosterEntries) {
      const dateKey = entry.rosterDate.toISOString().split('T')[0];
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, []);
      }
      dateGroups.get(dateKey)!.push(entry);
    }

    // Build roster response grouped by date
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const roster = [];

    // Iterate through each day in the range
    const current = new Date(start);
    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];
      const dayOfWeek = dayNames[current.getDay()];
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      const entriesForDate = dateGroups.get(dateKey) || [];

      // Group entries by shift for this date
      const shiftGroups = new Map<string, typeof rosterEntries>();
      let dateIsHoliday = false;
      for (const entry of entriesForDate) {
        if (entry.isHoliday) dateIsHoliday = true;
        if (!shiftGroups.has(entry.shiftId)) {
          shiftGroups.set(entry.shiftId, []);
        }
        shiftGroups.get(entry.shiftId)!.push(entry);
      }

      const shiftsForDate = [];
      let totalPlanned = 0;
      let totalActual = 0;

      for (const [sid, entries] of shiftGroups) {
        const shiftInfo = shiftsMap.get(sid);
        const scheduledEmployees = entries.filter(
          (e: any) => e.status === 'SCHEDULED' || e.status === 'COMPLETED'
        );
        const cancelledEmployees = entries.filter(
          (e: any) => e.status === 'CANCELLED' || e.status === 'SWAPPED'
        );

        const planned = entries.length;
        const actual = scheduledEmployees.length;
        totalPlanned += planned;
        totalActual += actual;

        shiftsForDate.push({
          shiftId: sid,
          shiftCode: shiftInfo?.code || '',
          shiftName: shiftInfo?.name || '',
          plannedStrength: planned,
          actualStrength: actual,
          employees: scheduledEmployees.map((e: any) => {
            const emp = employeeMap.get(e.employeeId);
            return {
              employeeId: e.employeeId,
              employeeCode: emp?.employeeCode || '',
              employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '',
              department: emp?.department?.name || '',
              status: e.status,
              customStartTime: e.customStartTime,
              customEndTime: e.customEndTime,
              isWeekOff: e.isWeekOff,
            };
          }),
          absentEmployees: cancelledEmployees.map((e: any) => {
            const emp = employeeMap.get(e.employeeId);
            return {
              employeeId: e.employeeId,
              employeeCode: emp?.employeeCode || '',
              employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '',
              reason: e.status === 'SWAPPED' ? 'Shift Swapped' : 'Cancelled',
            };
          }),
        });
      }

      roster.push({
        date: dateKey,
        dayOfWeek,
        isWeekend,
        isHoliday: dateIsHoliday,
        shifts: shiftsForDate,
        totalPlannedStrength: totalPlanned,
        totalActualStrength: totalActual,
        attendancePercentage:
          totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 10000) / 100 : 0,
      });

      current.setDate(current.getDate() + 1);
    }

    // Compute summary
    const totalDays = roster.length;
    const workingDays = roster.filter((d) => !d.isWeekend && !d.isHoliday).length;
    const weekendDays = roster.filter((d) => d.isWeekend).length;
    const holidays = roster.filter((d) => d.isHoliday).length;
    const totalStrengths = roster.map((d) => d.totalActualStrength);
    const averageStrength =
      totalStrengths.length > 0
        ? Math.round((totalStrengths.reduce((a, b) => a + b, 0) / totalStrengths.length) * 100) /
          100
        : 0;
    const attendancePercentages = roster
      .filter((d) => d.totalPlannedStrength > 0)
      .map((d) => d.attendancePercentage);
    const averageAttendancePercentage =
      attendancePercentages.length > 0
        ? Math.round(
            (attendancePercentages.reduce((a, b) => a + b, 0) / attendancePercentages.length) * 100
          ) / 100
        : 0;

    const responseData = {
      companyId,
      departmentId,
      startDate,
      endDate,
      shifts: Array.from(shiftsMap.values()),
      roster,
      summary: {
        totalDays,
        workingDays,
        weekendDays,
        holidays,
        averageStrength,
        averageAttendancePercentage,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Shift Roster API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch shift roster',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
