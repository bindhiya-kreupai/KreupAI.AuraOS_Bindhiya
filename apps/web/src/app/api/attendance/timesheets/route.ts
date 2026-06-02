import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch timesheets
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.employeeId || user.userId;
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const status = searchParams.get('status');

      const where: Record<string, unknown> = { tenantId: user.tenantId };

      if (employeeId) {
        where.employeeId = employeeId;
      }

      if (startDate || endDate) {
        const dateFilter: Record<string, Date> = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);
        where.date = dateFilter;
      }

      if (status) {
        where.status = status;
      }

      const records = await prisma.attendanceRecord.findMany({
        where,
        orderBy: [{ date: 'desc' }, { employeeId: 'asc' }],
      });

      // Collect unique employee IDs and look up names
      const employeeIds = [...new Set(records.map(r => r.employeeId))];
      const employees = employeeIds.length > 0
        ? await prisma.employee.findMany({
            where: { id: { in: employeeIds } },
            select: { id: true, firstName: true, lastName: true },
          })
        : [];
      const employeeMap = new Map(employees.map(e => [e.id, `${e.firstName} ${e.lastName}`]));

      // Group records by employee and week for timesheet view
      const timesheetMap = new Map<string, {
        employeeId: string;
        employeeName: string;
        weekEnding: string;
        entries: Array<{
          date: string;
          checkIn: string | null;
          checkOut: string | null;
          hours: number;
          status: string;
        }>;
        totalHours: number;
        overtimeHours: number;
      }>();

      for (const record of records) {
        const recordDate = new Date(record.date);
        // Calculate week ending (Sunday)
        const dayOfWeek = recordDate.getUTCDay();
        const weekEnd = new Date(recordDate);
        weekEnd.setUTCDate(weekEnd.getUTCDate() + (7 - dayOfWeek) % 7);
        const weekEnding = weekEnd.toISOString().split('T')[0];
        const key = `${record.employeeId}-${weekEnding}`;

        if (!timesheetMap.has(key)) {
          timesheetMap.set(key, {
            employeeId: record.employeeId,
            employeeName: employeeMap.get(record.employeeId) || 'Unknown Employee',
            weekEnding,
            entries: [],
            totalHours: 0,
            overtimeHours: 0,
          });
        }

        const ts = timesheetMap.get(key)!;
        ts.entries.push({
          date: record.date.toISOString().split('T')[0],
          checkIn: record.clockIn ? record.clockIn.toISOString() : null,
          checkOut: record.clockOut ? record.clockOut.toISOString() : null,
          hours: Math.round(record.workHours * 100) / 100,
          status: record.status,
        });
        ts.totalHours += record.workHours;
        ts.overtimeHours += record.overtimeHours;
      }

      const timesheets = Array.from(timesheetMap.values()).map((ts, index) => {
        const totalHoursRounded = Math.round(ts.totalHours * 100) / 100;
        const overtimeHoursRounded = Math.round(ts.overtimeHours * 100) / 100;
        const regularHours = Math.round((totalHoursRounded - overtimeHoursRounded) * 100) / 100;

        return {
          id: `ts-${index + 1}`,
          employeeId: ts.employeeId,
          employeeName: ts.employeeName,
          weekEnding: ts.weekEnding,
          totalHours: totalHoursRounded,
          regularHours: Math.max(regularHours, 0),
          overtimeHours: overtimeHoursRounded,
          status: ts.entries.some(e => e.status === 'ABSENT') ? 'PENDING' : 'APPROVED',
          entries: ts.entries.sort((a, b) => a.date.localeCompare(b.date)),
        };
      });

      return NextResponse.json({
        success: true,
        data: timesheets,
        meta: { total: timesheets.length },
      });
    } catch (error: any) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch timesheets' },
        { status: 500 }
      );
    }
  }
);

// POST - Submit timesheet
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const employeeId =
        body.employeeId && body.employeeId !== 'current-user' && body.employeeId !== 'current-user-id'
          ? body.employeeId
          : user.employeeId || user.userId;
      const { weekEnding, entries } = body;

      if (!employeeId || !weekEnding || !entries) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const totalHours = entries.reduce((sum: number, e: { hours: number }) => sum + e.hours, 0);
      const regularHours = Math.min(totalHours, 40);
      const overtimeHours = Math.max(totalHours - 40, 0);

      // Upsert attendance records for each entry
      const upsertedRecords = [];
      for (const entry of entries) {
        const entryDate = new Date(entry.date);
        const record = await prisma.attendanceRecord.upsert({
          where: {
            tenantId_employeeId_date: {
              tenantId: user.tenantId,
              employeeId,
              date: entryDate,
            },
          },
          update: {
            clockIn: entry.checkIn ? new Date(`${entry.date}T${entry.checkIn}`) : undefined,
            clockOut: entry.checkOut ? new Date(`${entry.date}T${entry.checkOut}`) : undefined,
            workHours: entry.hours || 0,
            status: entry.status || 'PRESENT',
            approvalStatus: 'PENDING',
            remarks: entry.notes || undefined,
          },
          create: {
            tenantId: user.tenantId,
            employeeId,
            date: entryDate,
            clockIn: entry.checkIn ? new Date(`${entry.date}T${entry.checkIn}`) : undefined,
            clockOut: entry.checkOut ? new Date(`${entry.date}T${entry.checkOut}`) : undefined,
            workHours: entry.hours || 0,
            status: entry.status || 'PRESENT',
            approvalStatus: 'PENDING',
            remarks: entry.notes || undefined,
          },
        });
        upsertedRecords.push(record);
      }

      const newTimesheet = {
        id: `ts-${Date.now()}`,
        employeeId,
        employeeName: '',
        weekEnding,
        totalHours,
        regularHours,
        overtimeHours,
        status: 'PENDING',
        entries,
        submittedAt: new Date().toISOString(),
        recordCount: upsertedRecords.length,
      };

      return NextResponse.json({ success: true, data: newTimesheet }, { status: 201 });
    } catch (error: any) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to submit timesheet' },
        { status: 500 }
      );
    }
  }
);
