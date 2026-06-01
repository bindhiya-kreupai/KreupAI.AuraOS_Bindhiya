export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

interface TimesheetEntry {
  projectId: string;
  projectName: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  totalHours: number;
}

/**
 * GET /api/v1/attendance/projects/timesheet
 * Query ProjectTimeEntry for weekly timesheet
 *
 * Query Parameters:
 * - weekStart (optional): Monday of the week (YYYY-MM-DD), defaults to current week
 * - employeeId (optional): Filter by employee (defaults to current user's employee)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('attendance:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing attendance:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = context.user.tenantId;

    // Determine week start (Monday)
    const weekStartParam = searchParams.get('weekStart');
    let weekStart: Date;
    if (weekStartParam) {
      weekStart = new Date(weekStartParam);
    } else {
      weekStart = new Date();
      const day = weekStart.getDay();
      const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
      weekStart.setDate(weekStart.getDate() + diff);
    }
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Determine employee
    let employeeId = searchParams.get('employeeId');
    if (!employeeId && context.employeeId) {
      employeeId = context.employeeId;
    }

    if (!employeeId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'employeeId is required (or user must have an associated employee)',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Fetch time entries for the week
    const timeEntries = await prisma.projectTimeEntry.findMany({
      where: {
        tenantId,
        employeeId,
        date: { gte: weekStart, lte: weekEnd },
      },
      orderBy: { date: 'asc' },
    });

    // Look up employee info
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { firstName: true, lastName: true },
    });

    // Group entries by project, then by day of week
    const projectEntries = new Map<string, { entries: typeof timeEntries }>();
    for (const entry of timeEntries) {
      const existing = projectEntries.get(entry.projectId) || { entries: [] };
      existing.entries.push(entry);
      projectEntries.set(entry.projectId, existing);
    }

    // Day name helpers based on day offset from weekStart
    const dayNames = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ] as const;

    const entries: TimesheetEntry[] = [];
    let totalWeeklyHours = 0;

    for (const [projectId, { entries: projectTimeEntries }] of projectEntries) {
      const dayHours: Record<string, number> = {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
      };

      for (const entry of projectTimeEntries) {
        const entryDate = new Date(entry.date);
        const dayOffset = Math.floor(
          (entryDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dayOffset >= 0 && dayOffset < 7) {
          const dayName = dayNames[dayOffset];
          dayHours[dayName] += entry.hours;
        }
      }

      const totalHours = Object.values(dayHours).reduce((sum, h) => sum + h, 0);
      totalWeeklyHours += totalHours;

      entries.push({
        projectId,
        projectName: projectId, // ProjectTimeEntry doesn't have a project relation; use projectId
        monday: dayHours.monday,
        tuesday: dayHours.tuesday,
        wednesday: dayHours.wednesday,
        thursday: dayHours.thursday,
        friday: dayHours.friday,
        saturday: dayHours.saturday,
        sunday: dayHours.sunday,
        totalHours: parseFloat(totalHours.toFixed(2)),
      });
    }

    // Determine timesheet status based on entry statuses
    const allStatuses = timeEntries.map((e) => e.status);
    let timesheetStatus: string = 'draft';
    if (allStatuses.length === 0) {
      timesheetStatus = 'draft';
    } else if (allStatuses.every((s) => s === 'APPROVED')) {
      timesheetStatus = 'approved';
    } else if (allStatuses.some((s) => s === 'SUBMITTED' || s === 'APPROVED')) {
      timesheetStatus = 'submitted';
    } else {
      timesheetStatus = 'draft';
    }

    const responseData = {
      employeeId,
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
      weekStartDate: weekStart.toISOString().split('T')[0],
      weekEndDate: weekEnd.toISOString().split('T')[0],
      entries,
      totalWeeklyHours: parseFloat(totalWeeklyHours.toFixed(2)),
      status: timesheetStatus,
    };

    const response: ApiResponse = {
      success: true,
      data: responseData,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Projects Timesheet API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch weekly timesheet',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});
