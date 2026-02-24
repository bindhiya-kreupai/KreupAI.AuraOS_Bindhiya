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
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

/**
 * GET /api/v1/attendance/report
 * Get attendance report for employees
 *
 * Query Parameters:
 * - companyId (required): Company ID
 * - departmentId (optional): Filter by department
 * - employeeId (optional): Filter by specific employee
 * - startDate (required): Start date in YYYY-MM-DD format
 * - endDate (required): End date in YYYY-MM-DD format
 * - page (optional): Page number (default: 1)
 * - limit (optional): Records per page (default: 20, max: 100)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = context.user.tenantId;
    const companyId = searchParams.get('companyId');
    const departmentId = searchParams.get('departmentId');
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

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

    // Build employee filter based on company and department
    interface EmployeeWhereFilter {
      companyId: string;
      departmentId?: string;
      id?: string;
    }
    const employeeWhere: EmployeeWhereFilter = { companyId };
    if (departmentId) employeeWhere.departmentId = departmentId;
    if (employeeId) employeeWhere.id = employeeId;

    // Get employees matching the filter
    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        department: { select: { name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalEmployees = await prisma.employee.count({ where: employeeWhere });

    const employeeIds = employees.map((e) => e.id);

    // Get attendance records for these employees in the date range
    const records = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        date: { gte: start, lte: end },
      },
    });

    // Get regularization requests count
    const regularizations = await prisma.attendanceRegularization.findMany({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        date: { gte: start, lte: end },
      },
      select: {
        employeeId: true,
        status: true,
      },
    });

    // Group records by employee
    const recordsByEmployee = new Map<string, typeof records>();
    for (const record of records) {
      const existing = recordsByEmployee.get(record.employeeId) || [];
      existing.push(record);
      recordsByEmployee.set(record.employeeId, existing);
    }

    // Group regularizations by employee
    const regByEmployee = new Map<string, { total: number; pending: number }>();
    for (const reg of regularizations) {
      const existing = regByEmployee.get(reg.employeeId) || { total: 0, pending: 0 };
      existing.total++;
      if (reg.status === 'PENDING') existing.pending++;
      regByEmployee.set(reg.employeeId, existing);
    }

    // Calculate total working days in the range
    const totalDaysInRange = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Build report for each employee
    const report = employees.map((emp) => {
      const empRecords = recordsByEmployee.get(emp.id) || [];
      const empRegs = regByEmployee.get(emp.id) || { total: 0, pending: 0 };

      const presentDays = empRecords.filter((r) => ['PRESENT', 'LATE', 'EARLY_OUT'].includes(r.status)).length;
      const absentDays = empRecords.filter((r) => r.status === 'ABSENT').length;
      const leaveDays = empRecords.filter((r) => r.status === 'ON_LEAVE').length;
      const halfDays = empRecords.filter((r) => r.status === 'HALF_DAY').length;
      const holidays = empRecords.filter((r) => r.status === 'HOLIDAY').length;
      const weekendDays = empRecords.filter((r) => r.status === 'WEEK_OFF').length;
      const lateDays = empRecords.filter((r) => r.isLate).length;
      const earlyLeaveDays = empRecords.filter((r) => r.isEarlyOut).length;

      const totalWorkMinutes = Math.round(empRecords.reduce((sum, r) => sum + r.workHours * 60, 0));
      const totalOvertimeMinutes = Math.round(empRecords.reduce((sum, r) => sum + r.overtimeHours * 60, 0));
      const overtimeDays = empRecords.filter((r) => r.overtimeHours > 0).length;

      // For late/early metrics, we approximate from the records
      const workingDays = totalDaysInRange - weekendDays - holidays;
      const attendancePercentage = workingDays > 0
        ? parseFloat(((presentDays / workingDays) * 100).toFixed(2))
        : 0;

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department.name,
        totalDays: totalDaysInRange,
        presentDays,
        absentDays,
        leaveDays,
        halfDays,
        weekendDays,
        holidays,
        lateDays,
        totalLateMinutes: 0, // Would need punch-level data for precise calculation
        averageLateMinutes: 0,
        earlyLeaveDays,
        totalEarlyLeaveMinutes: 0,
        overtimeDays,
        totalOvertimeMinutes,
        averageOvertimeMinutes: overtimeDays > 0 ? Math.round(totalOvertimeMinutes / overtimeDays) : 0,
        totalWorkMinutes,
        attendancePercentage,
        regularizationRequests: empRegs.total,
        pendingRegularizations: empRegs.pending,
      };
    });

    const response: ApiResponse = {
      success: true,
      data: report,
      meta: {
        pagination: {
          page,
          limit,
          total: totalEmployees,
          totalPages: Math.ceil(totalEmployees / limit),
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Attendance Report API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch attendance report',
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
