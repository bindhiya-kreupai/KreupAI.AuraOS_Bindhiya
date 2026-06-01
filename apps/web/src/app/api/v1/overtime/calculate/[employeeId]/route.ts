import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { permissions } = context;
  if (!permissions.includes('overtime:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing overtime:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { params } = context;
    const { employeeId } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '2026-W08';

    // Simulated employee lookup with tenant isolation
    const knownEmployees = ['emp-001', 'emp-002', 'emp-003', 'emp-010'];
    if (!knownEmployees.includes(employeeId)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Employee with id '${employeeId}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const baseHourlyRate = 36.06;
    const regularHours = 40;
    const overtimeHours = 6.5;
    const doubleTimeHours = 0;
    const totalHours = regularHours + overtimeHours + doubleTimeHours;

    const otCalculation = {
      tenantId: 'tenant-1',
      employeeId,
      employeeName: 'John Smith',
      period,
      flsaStatus: 'NON_EXEMPT',
      payType: 'HOURLY',
      jurisdiction: 'FEDERAL',
      workweekStart: 'Monday',
      payRates: {
        baseHourlyRate,
        regularRatePay: baseHourlyRate, // includes any non-discretionary bonuses
        regularRateCalculation: 'Base hourly rate only (no bonuses this period)',
      },
      hoursWorked: {
        totalHours,
        regularHours,
        overtimeHours,
        doubleTimeHours,
        dailyBreakdown: [
          { date: '2026-02-16', day: 'Monday', hours: 8.0, regularHours: 8.0, otHours: 0 },
          { date: '2026-02-17', day: 'Tuesday', hours: 9.5, regularHours: 9.5, otHours: 0 },
          { date: '2026-02-18', day: 'Wednesday', hours: 8.0, regularHours: 8.0, otHours: 0 },
          { date: '2026-02-19', day: 'Thursday', hours: 8.0, regularHours: 8.0, otHours: 0 },
          { date: '2026-02-20', day: 'Friday', hours: 6.5, regularHours: 4.5, otHours: 2.0 },
          { date: '2026-02-21', day: 'Saturday', hours: 4.5, regularHours: 0, otHours: 4.5 },
          { date: '2026-02-22', day: 'Sunday', hours: 0, regularHours: 0, otHours: 0 },
        ],
      },
      earnings: {
        regularPay: Math.round(regularHours * baseHourlyRate * 100) / 100,
        overtimePay: Math.round(overtimeHours * baseHourlyRate * 1.5 * 100) / 100,
        doubleTimePay: 0,
        totalGrossPay:
          Math.round((regularHours * baseHourlyRate + overtimeHours * baseHourlyRate * 1.5) * 100) /
          100,
      },
      preApproved: {
        isPreApproved: true,
        approvalId: 'ota-045',
        approvedHours: 8,
        actualHours: overtimeHours,
        approvedBy: 'mgr-001',
      },
      calculatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: otCalculation,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to calculate overtime',
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
