import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export async function GET(request: NextRequest, { params }: { params: { employeeId: string } }) {
  try {
    const { employeeId } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '2026-W08'; // ISO week or month

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

    const flsaCheck = {
      tenantId: 'tenant-1',
      employeeId,
      employeeName: 'John Smith',
      period,
      flsaClassification: 'NON_EXEMPT',
      classificationBasis: 'SALARY_LEVEL_TEST',
      weeklyHours: 46.5,
      overtimeHours: 6.5,
      regularRatePay: 36.06, // per hour (effective rate including all remuneration)
      complianceStatus: 'COMPLIANT',
      checks: [
        {
          checkType: 'MINIMUM_WAGE',
          status: 'PASS',
          requiredRate: 7.25,
          actualRate: 36.06,
          details: 'Effective hourly rate of $36.06 exceeds federal minimum wage of $7.25',
        },
        {
          checkType: 'OVERTIME_PAY',
          status: 'PASS',
          regularHours: 40,
          overtimeHours: 6.5,
          regularPay: 1442.31,
          overtimePay: 351.59,
          overtimeMultiplier: 1.5,
          details: 'Overtime paid at 1.5x regular rate for all hours over 40 in workweek',
        },
        {
          checkType: 'RECORD_KEEPING',
          status: 'PASS',
          details: 'All timekeeping records are complete and accurate for this period',
        },
        {
          checkType: 'WORKWEEK_DEFINITION',
          status: 'PASS',
          workweekStart: 'Monday',
          details: 'Workweek is consistently defined as Monday 12:00 AM to Sunday 11:59 PM',
        },
      ],
      warnings: [],
      violations: [],
      checkedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: flsaCheck,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (_error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to check FLSA compliance',
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
}
