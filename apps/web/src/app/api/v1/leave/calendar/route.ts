import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/leave/calendar
 * Get leave calendar showing all approved leaves for team/company
 *
 * Query Parameters:
 * - companyId (required): Company ID
 * - departmentId (optional): Filter by department
 * - startDate (required): Start date in YYYY-MM-DD format
 * - endDate (required): End date in YYYY-MM-DD format
 * - view (optional): 'team' or 'company' (defaults to 'team')
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('leave:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leave:read permission',
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
    const view = searchParams.get('view') || 'team';

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

    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    // Build employee filter for the leave requests
    const employeeWhere: Record<string, any> = {
      companyId,
      company: { tenantId: user.tenantId },
    };
    if (departmentId) {
      employeeWhere.departmentId = departmentId;
    }

    // Get employees matching the filter (for team strength calculation)
    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true },
    });
    const employeeIds = employees.map((e) => e.id);
    const totalTeamSize = employeeIds.length;

    // Get approved leave requests in date range for matching employees
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        tenantId: user.tenantId,
        employeeId: { in: employeeIds },
        status: 'APPROVED',
        startDate: { lte: rangeEnd },
        endDate: { gte: rangeStart },
      },
      select: {
        id: true,
        employeeId: true,
        leaveTypeId: true,
        startDate: true,
        endDate: true,
        totalDays: true,
        halfDayStart: true,
        halfDayEnd: true,
        status: true,
      },
    });

    // Get employee details for the ones on leave
    const leaveEmployeeIds = [...new Set(leaveRequests.map((lr) => lr.employeeId))];
    const leaveEmployees =
      leaveEmployeeIds.length > 0
        ? await prisma.employee.findMany({
            where: { id: { in: leaveEmployeeIds } },
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              department: { select: { name: true } },
            },
          })
        : [];
    const employeeMap = new Map(leaveEmployees.map((e) => [e.id, e]));

    // Get holidays in the date range
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'Active',
      },
      select: {
        name: true,
        date: true,
        type: true,
      },
    });
    const holidayMap = new Map(holidays.map((h) => [h.date, h]));

    // Build day-by-day calendar
    const dayMap = new Map<
      string,
      {
        employees: any[];
        publicHoliday: any;
      }
    >();

    // Initialize all dates in range
    const current = new Date(rangeStart);
    while (current <= rangeEnd) {
      const dateStr = current.toISOString().split('T')[0];
      const holiday = holidayMap.get(dateStr);
      dayMap.set(dateStr, {
        employees: [],
        publicHoliday: holiday
          ? { name: holiday.name, type: holiday.type.toUpperCase(), isOptional: false }
          : null,
      });
      current.setDate(current.getDate() + 1);
    }

    // Populate leave entries per day
    for (const lr of leaveRequests) {
      const emp = employeeMap.get(lr.employeeId);
      if (!emp) continue;

      const leaveStart = lr.startDate > rangeStart ? lr.startDate : rangeStart;
      const leaveEnd = lr.endDate < rangeEnd ? lr.endDate : rangeEnd;
      const dayCursor = new Date(leaveStart);

      while (dayCursor <= leaveEnd) {
        const dateStr = dayCursor.toISOString().split('T')[0];
        const dayEntry = dayMap.get(dateStr);
        if (dayEntry) {
          // Determine if this particular day is half-day
          const isFirstDay = dayCursor.toDateString() === lr.startDate.toDateString();
          const isLastDay = dayCursor.toDateString() === lr.endDate.toDateString();
          let duration = 'FULL_DAY';
          let halfDayPeriod: string | undefined;

          if (isFirstDay && lr.halfDayStart) {
            duration = 'HALF_DAY';
            halfDayPeriod = 'SECOND_HALF';
          } else if (isLastDay && lr.halfDayEnd) {
            duration = 'HALF_DAY';
            halfDayPeriod = 'FIRST_HALF';
          }

          const entry: Record<string, any> = {
            employeeId: emp.id,
            employeeCode: emp.employeeCode,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            department: emp.department?.name ?? null,
            leaveTypeId: lr.leaveTypeId,
            duration,
            status: lr.status,
          };
          if (halfDayPeriod) {
            entry.halfDayPeriod = halfDayPeriod;
          }

          dayEntry.employees.push(entry);
        }
        dayCursor.setDate(dayCursor.getDate() + 1);
      }
    }

    // Build leaves array and summary stats
    const leaves: any[] = [];
    let totalWorkingDays = 0;
    let totalPublicHolidays = 0;
    let totalWeekendDays = 0;
    let peakAbsenceDate = '';
    let peakAbsenceCount = 0;
    let totalStrengthPercentage = 0;
    let workingDayCount = 0;

    for (const [dateStr, dayEntry] of dayMap) {
      const dayOfWeek = new Date(dateStr).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = dayEntry.publicHoliday !== null;

      if (isWeekend) totalWeekendDays++;
      if (isHoliday) totalPublicHolidays++;
      if (!isWeekend && !isHoliday) totalWorkingDays++;

      const onLeave = dayEntry.employees.length;
      const present = isHoliday || isWeekend ? 0 : Math.max(0, totalTeamSize - onLeave);
      const percentage =
        totalTeamSize > 0
          ? isHoliday || isWeekend
            ? 0
            : Math.round((present / totalTeamSize) * 100 * 10) / 10
          : 0;

      if (!isWeekend && !isHoliday) {
        totalStrengthPercentage += percentage;
        workingDayCount++;
      }

      if (onLeave > peakAbsenceCount) {
        peakAbsenceCount = onLeave;
        peakAbsenceDate = dateStr;
      }

      leaves.push({
        date: dateStr,
        employees: dayEntry.employees,
        publicHoliday: dayEntry.publicHoliday,
        teamStrength: {
          total: totalTeamSize,
          present,
          onLeave,
          percentage,
        },
      });
    }

    const totalDays = leaves.length;
    const averageTeamStrength =
      workingDayCount > 0 ? Math.round((totalStrengthPercentage / workingDayCount) * 10) / 10 : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          companyId,
          departmentId,
          startDate,
          endDate,
          view,
          leaves,
          summary: {
            totalDays,
            workingDays: totalWorkingDays,
            publicHolidays: totalPublicHolidays,
            weekendDays: totalWeekendDays,
            averageTeamStrength,
            peakAbsenceDate: peakAbsenceDate || null,
            peakAbsenceCount,
          },
          generatedAt: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Leave Calendar API] GET Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch leave calendar',
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
