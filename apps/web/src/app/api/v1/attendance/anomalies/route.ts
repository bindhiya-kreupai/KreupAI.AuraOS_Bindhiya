export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// API Response Standard
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

interface Anomaly {
  id: string;
  type: string;
  severity: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  description: string;
  details: Record<string, unknown>;
  detectedAt: string;
}

/**
 * GET /api/v1/attendance/anomalies
 * Detect and report attendance anomalies
 *
 * Query Parameters:
 * - companyId (required): Company ID
 * - departmentId (optional): Filter by department
 * - startDate (required): Start date in YYYY-MM-DD format
 * - endDate (required): End date in YYYY-MM-DD format
 * - anomalyTypes (optional): Comma-separated list of anomaly types to filter
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = context.user.tenantId;
    const companyId = searchParams.get('companyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const anomalyTypes = searchParams.get('anomalyTypes')?.split(',');

    if (!companyId || !startDate || !endDate) {
      const response: ApiResponse = {
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
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      const response: ApiResponse = {
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
      };

      return NextResponse.json(response, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date().toISOString();

    // Get employees for this company
    const departmentId = searchParams.get('departmentId');
    interface EmployeeFilter {
      companyId: string;
      departmentId?: string;
    }
    const empFilter: EmployeeFilter = { companyId };
    if (departmentId) empFilter.departmentId = departmentId;

    const employees = await prisma.employee.findMany({
      where: empFilter,
      select: { id: true, employeeCode: true, firstName: true, lastName: true },
    });
    const employeeIds = employees.map((e) => e.id);
    const employeeMap = new Map(employees.map((e) => [e.id, e]));

    // Fetch attendance records in range
    const records = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    const anomalies: Anomaly[] = [];

    for (const record of records) {
      const emp = employeeMap.get(record.employeeId);
      if (!emp) continue;

      const dateStr = record.date.toISOString().split('T')[0];

      // MISSING_CLOCK_OUT: Has clockIn but no clockOut
      if (record.clockIn && !record.clockOut && record.status !== 'ABSENT' && record.status !== 'ON_LEAVE') {
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'MISSING_CLOCK_OUT',
          severity: 'HIGH',
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          date: dateStr,
          description: `Employee clocked in at ${record.clockIn.toISOString().split('T')[1]?.substring(0, 8)} but did not clock out`,
          details: {
            clockInTime: record.clockIn.toISOString().split('T')[1]?.substring(0, 8),
            clockOutTime: null,
          },
          detectedAt: now,
        });
      }

      // EXCESSIVE_LATE: Late more than 30 minutes
      if (record.isLate && record.clockIn && record.shiftStartTime) {
        const lateMs = record.clockIn.getTime() - record.shiftStartTime.getTime();
        const lateMinutes = Math.floor(lateMs / (1000 * 60));
        if (lateMinutes > 30) {
          anomalies.push({
            id: crypto.randomUUID(),
            type: 'EXCESSIVE_LATE',
            severity: 'MEDIUM',
            employeeId: emp.id,
            employeeCode: emp.employeeCode,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            date: dateStr,
            description: `Employee was late by ${lateMinutes} minutes (threshold: 30 minutes)`,
            details: {
              clockInTime: record.clockIn.toISOString().split('T')[1]?.substring(0, 8),
              expectedTime: record.shiftStartTime.toISOString().split('T')[1]?.substring(0, 8),
              lateMinutes,
              threshold: 30,
            },
            detectedAt: now,
          });
        }
      }

      // EXCESSIVE_OVERTIME: More than 2 hours
      if (record.overtimeHours > 2) {
        const overtimeMinutes = Math.round(record.overtimeHours * 60);
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'EXCESSIVE_OVERTIME',
          severity: 'MEDIUM',
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          date: dateStr,
          description: `Overtime exceeds daily limit (${record.overtimeHours.toFixed(1)} hours vs 2 hours allowed)`,
          details: {
            overtimeMinutes,
            dailyLimit: 120,
            excessMinutes: overtimeMinutes - 120,
          },
          detectedAt: now,
        });
      }
    }

    // CONSECUTIVE_ABSENCES: Check for 3+ consecutive absent days per employee
    const recordsByEmployee = new Map<string, typeof records>();
    for (const record of records) {
      const existing = recordsByEmployee.get(record.employeeId) || [];
      existing.push(record);
      recordsByEmployee.set(record.employeeId, existing);
    }

    for (const [empId, empRecords] of recordsByEmployee) {
      const emp = employeeMap.get(empId);
      if (!emp) continue;

      const sorted = empRecords.sort((a, b) => a.date.getTime() - b.date.getTime());
      let consecutiveAbsent = 0;
      let absenceStart: Date | null = null;

      for (const rec of sorted) {
        if (rec.status === 'ABSENT') {
          if (consecutiveAbsent === 0) absenceStart = rec.date;
          consecutiveAbsent++;
        } else {
          if (consecutiveAbsent >= 3 && absenceStart) {
            anomalies.push({
              id: crypto.randomUUID(),
              type: 'CONSECUTIVE_ABSENCES',
              severity: 'CRITICAL',
              employeeId: emp.id,
              employeeCode: emp.employeeCode,
              employeeName: `${emp.firstName} ${emp.lastName}`,
              date: absenceStart.toISOString().split('T')[0],
              description: `Employee absent for ${consecutiveAbsent} consecutive days without leave approval`,
              details: {
                startDate: absenceStart.toISOString().split('T')[0],
                endDate: sorted[sorted.indexOf(rec) - 1]?.date.toISOString().split('T')[0],
                consecutiveDays: consecutiveAbsent,
              },
              detectedAt: now,
            });
          }
          consecutiveAbsent = 0;
          absenceStart = null;
        }
      }

      // Check if streak extends to end of range
      if (consecutiveAbsent >= 3 && absenceStart) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'CONSECUTIVE_ABSENCES',
          severity: 'CRITICAL',
          employeeId: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          date: absenceStart.toISOString().split('T')[0],
          description: `Employee absent for ${consecutiveAbsent} consecutive days without leave approval`,
          details: {
            startDate: absenceStart.toISOString().split('T')[0],
            endDate: sorted[sorted.length - 1]?.date.toISOString().split('T')[0],
            consecutiveDays: consecutiveAbsent,
          },
          detectedAt: now,
        });
      }
    }

    // Filter by anomaly types if specified
    const filteredAnomalies = anomalyTypes
      ? anomalies.filter((a) => anomalyTypes.includes(a.type))
      : anomalies;

    // Build summary
    const byType: Record<string, number> = {};
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;

    for (const a of filteredAnomalies) {
      byType[a.type] = (byType[a.type] || 0) + 1;
      if (a.severity === 'CRITICAL') criticalCount++;
      if (a.severity === 'HIGH') highCount++;
      if (a.severity === 'MEDIUM') mediumCount++;
    }

    const responseData = {
      summary: {
        totalAnomalies: filteredAnomalies.length,
        byType,
        criticalCount,
        highCount,
        mediumCount,
      },
      anomalies: filteredAnomalies,
      generatedAt: now,
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

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Attendance Anomalies API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch attendance anomalies',
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
