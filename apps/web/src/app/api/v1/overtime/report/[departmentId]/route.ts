import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export async function GET(request: NextRequest, { params }: { params: { departmentId: string } }) {
  try {
    const { departmentId } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '2026-Q1';

    // Simulated department lookup with tenant isolation
    const knownDepartments = [
      'dept-engineering',
      'dept-operations',
      'dept-warehouse',
      'dept-customer-service',
    ];
    if (!knownDepartments.includes(departmentId)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Department with id '${departmentId}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const otReport = {
      tenantId: 'tenant-1',
      departmentId,
      departmentName: departmentId
        .replace('dept-', '')
        .replace('-', ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        totalEmployees: 42,
        employeesWithOT: 18,
        otParticipationRate: 42.9,
        totalOtHours: 284.5,
        totalOtCost: 15398.22,
        averageOtHoursPerEmployee: 6.77,
        maxOtByEmployee: { employeeId: 'emp-001', name: 'John Smith', hours: 42.5 },
        preApprovalComplianceRate: 94.4,
      },
      weeklyBreakdown: [
        { week: '2026-W01', employees: 8, hours: 52.5, cost: 2842.77 },
        { week: '2026-W02', employees: 12, hours: 88.0, cost: 4762.08 },
        { week: '2026-W03', employees: 6, hours: 44.0, cost: 2381.04 },
        { week: '2026-W04', employees: 10, hours: 75.0, cost: 4060.5 },
        { week: '2026-W05', employees: 7, hours: 25.0, cost: 1351.83 },
      ],
      employeeDetail: [
        {
          employeeId: 'emp-001',
          name: 'John Smith',
          title: 'Senior Software Engineer',
          baseHourlyRate: 36.06,
          otHours: 42.5,
          otPay: 2298.82,
          preApproved: true,
          preApprovalIds: ['ota-001', 'ota-045'],
        },
        {
          employeeId: 'emp-005',
          name: 'Lisa Park',
          title: 'DevOps Engineer',
          baseHourlyRate: 37.5,
          otHours: 38.0,
          otPay: 2137.5,
          preApproved: true,
          preApprovalIds: ['ota-002'],
        },
        {
          employeeId: 'emp-012',
          name: 'Tom Bradley',
          title: 'Software Engineer',
          baseHourlyRate: 30.0,
          otHours: 12.0,
          otPay: 540.0,
          preApproved: false,
          preApprovalIds: [],
          complianceFlag: 'OT_WITHOUT_PREAPPROVAL',
        },
      ],
      complianceIssues: [
        {
          type: 'OT_WITHOUT_PREAPPROVAL',
          severity: 'MEDIUM',
          count: 3,
          description: '3 instances of overtime worked without prior manager approval',
          affectedEmployees: ['emp-012', 'emp-017', 'emp-023'],
          action: 'Retroactive approval required; coach managers on pre-approval workflow',
        },
      ],
      trends: {
        vsLastPeriod: { hoursChange: 8.2, costChange: 6.4, percentChange: 6.4 },
        vsBudget: { budgeted: 15000, actual: 15398.22, variance: 398.22, variancePercent: 2.7 },
      },
    };

    const response: ApiResponse = {
      success: true,
      data: otReport,
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
        message: 'Failed to get OT report',
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
