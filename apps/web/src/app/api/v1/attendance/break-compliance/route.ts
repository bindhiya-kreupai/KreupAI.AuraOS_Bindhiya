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

interface BreakComplianceEntry {
  employeeId: string;
  employeeName: string;
  date: string;
  requiredBreakMinutes: number;
  actualBreakMinutes: number;
  isCompliant: boolean;
  violations: string[];
}

/**
 * GET /api/v1/attendance/break-compliance
 * Compute break compliance from AttendancePunch break records
 *
 * Query Parameters:
 * - startDate (optional): Period start date (YYYY-MM-DD), defaults to start of current week
 * - endDate (optional): Period end date (YYYY-MM-DD), defaults to end of current week
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

    // Calculate default date range (current week)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() - dayOfWeek + 1); // Monday
    defaultStart.setHours(0, 0, 0, 0);
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultStart.getDate() + 6); // Sunday

    const startDateStr = searchParams.get('startDate') || defaultStart.toISOString().split('T')[0];
    const endDateStr = searchParams.get('endDate') || defaultEnd.toISOString().split('T')[0];

    const periodStart = new Date(startDateStr);
    const periodEnd = new Date(endDateStr);

    // Get all break punches (BREAK_START / BREAK_END) for the tenant in the period
    const breakPunches = await prisma.attendancePunch.findMany({
      where: {
        tenantId,
        punchType: { in: ['BREAK_START', 'BREAK_END'] },
        punchDate: { gte: periodStart, lte: periodEnd },
      },
      orderBy: [{ employeeId: 'asc' }, { punchDate: 'asc' }, { punchTime: 'asc' }],
    });

    // Get unique employee IDs from break punches
    const employeeIds = [...new Set(breakPunches.map((p) => p.employeeId))];

    // Also get employees who have attendance records but no break punches (potential violations)
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        date: { gte: periodStart, lte: periodEnd },
        status: { in: ['PRESENT', 'LATE', 'EARLY_OUT'] },
        workHours: { gte: 6 }, // Only care about shifts >= 6 hours
      },
      select: { employeeId: true, date: true, workHours: true },
    });

    // Combine all employee IDs
    const allEmployeeIds = [
      ...new Set([...employeeIds, ...attendanceRecords.map((r) => r.employeeId)]),
    ];

    // Look up employees
    const employees = await prisma.employee.findMany({
      where: { id: { in: allEmployeeIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const employeeMap = new Map(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));

    // Get shift info for break duration requirements
    // Cast: the `shift` relation is not declared on ShiftAssignment in schema.prisma
    const shiftAssignments = await (prisma as any).shiftAssignment.findMany({
      where: {
        tenantId,
        employeeId: { in: allEmployeeIds },
        isActive: true,
      },
      include: { shift: true },
    });
    const shiftMap = new Map<string, any>(
      shiftAssignments.map((sa: any) => [sa.employeeId, sa.shift] as [string, any])
    );

    // Group break punches by employee and date
    const breaksByEmployeeDate = new Map<string, typeof breakPunches>();
    for (const punch of breakPunches) {
      const key = `${punch.employeeId}|${punch.punchDate.toISOString().split('T')[0]}`;
      const existing = breaksByEmployeeDate.get(key) || [];
      existing.push(punch);
      breaksByEmployeeDate.set(key, existing);
    }

    // Track which employee-date combos had attendance (worked >= 6 hours)
    const attendanceByEmployeeDate = new Map<string, number>();
    for (const rec of attendanceRecords) {
      const key = `${rec.employeeId}|${rec.date.toISOString().split('T')[0]}`;
      attendanceByEmployeeDate.set(key, rec.workHours);
    }

    const entries: BreakComplianceEntry[] = [];

    // Process all employee-date combinations
    const processedKeys = new Set<string>();

    // Process employees who have break punches
    for (const [key, punches] of breaksByEmployeeDate) {
      processedKeys.add(key);
      const [empId, dateStr] = key.split('|');
      const empName = employeeMap.get(empId) || 'Unknown';

      // Calculate actual break duration
      let actualBreakMinutes = 0;
      const sortedPunches = punches.sort(
        (a: any, b: any) => a.punchTime.getTime() - b.punchTime.getTime()
      );

      for (let i = 0; i < sortedPunches.length - 1; i += 2) {
        if (
          sortedPunches[i].punchType === 'BREAK_START' &&
          sortedPunches[i + 1]?.punchType === 'BREAK_END'
        ) {
          const breakMs =
            sortedPunches[i + 1].punchTime.getTime() - sortedPunches[i].punchTime.getTime();
          actualBreakMinutes += Math.floor(breakMs / (1000 * 60));
        }
      }

      // Get required break from shift or default to 60
      const shift = shiftMap.get(empId);
      const requiredBreakMinutes = shift?.breakDuration || 60;

      const violations: string[] = [];
      if (actualBreakMinutes < requiredBreakMinutes) {
        violations.push('Insufficient lunch break duration');
      }

      // Check for work without break (6+ consecutive hours)
      const workHours = attendanceByEmployeeDate.get(key) || 0;
      if (workHours >= 6 && actualBreakMinutes === 0) {
        violations.push('Worked more than 6 consecutive hours');
        violations.push('No lunch break taken');
      }

      entries.push({
        employeeId: empId,
        employeeName: empName,
        date: dateStr,
        requiredBreakMinutes,
        actualBreakMinutes,
        isCompliant: violations.length === 0,
        violations,
      });
    }

    // Process employees with attendance but no break punches
    for (const [key, workHours] of attendanceByEmployeeDate) {
      if (processedKeys.has(key)) continue;

      const [empId, dateStr] = key.split('|');
      const empName = employeeMap.get(empId) || 'Unknown';
      const shift = shiftMap.get(empId);
      const requiredBreakMinutes = shift?.breakDuration || 60;

      const violations: string[] = [];
      if (workHours >= 6) {
        violations.push('No lunch break taken');
        violations.push('Worked more than 6 consecutive hours');
      }

      entries.push({
        employeeId: empId,
        employeeName: empName,
        date: dateStr,
        requiredBreakMinutes,
        actualBreakMinutes: 0,
        isCompliant: violations.length === 0,
        violations,
      });
    }

    const compliantCount = entries.filter((e) => e.isCompliant).length;
    const nonCompliantCount = entries.filter((e) => !e.isCompliant).length;
    const totalEmployees = new Set(entries.map((e) => e.employeeId)).size;
    const complianceRate =
      entries.length > 0 ? parseFloat(((compliantCount / entries.length) * 100).toFixed(1)) : 100;

    const reportData = {
      reportDate: new Date().toISOString(),
      periodStart: startDateStr,
      periodEnd: endDateStr,
      totalEmployees,
      compliantCount,
      nonCompliantCount,
      complianceRate,
      entries,
    };

    const response: ApiResponse = {
      success: true,
      data: reportData,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Break Compliance API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to compute break compliance report',
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
