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
    const { departmentId } = params;
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get('fiscalYear') || String(new Date().getFullYear()));

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

    const annualBudget = 48000;
    const spentYTD = 18520.5;
    const committedPending = 2160.0;
    const available = annualBudget - spentYTD - committedPending;
    const percentUsed = Math.round((spentYTD / annualBudget) * 1000) / 10;
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const expectedBudgetUsedByNow = Math.round((currentMonth / 12) * annualBudget * 100) / 100;
    const budgetStatus =
      spentYTD > expectedBudgetUsedByNow * 1.1
        ? 'OVER_PACE'
        : spentYTD < expectedBudgetUsedByNow * 0.9
          ? 'UNDER_PACE'
          : 'ON_PACE';

    const budgetData = {
      tenantId: 'tenant-1',
      departmentId,
      departmentName: departmentId
        .replace('dept-', '')
        .replace('-', ' ')
        .replace(/\b\w/g, (l: any) => l.toUpperCase()),
      fiscalYear,
      budget: {
        annual: annualBudget,
        quarterly: { Q1: 11000, Q2: 12000, Q3: 13000, Q4: 12000 },
        monthly: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          budget: Math.round(annualBudget / 12),
          spent:
            i < currentMonth - 1
              ? Math.round(Math.random() * 2000 + 1200)
              : i === currentMonth - 1
                ? 1850
                : 0,
        })),
      },
      ytdSummary: {
        budgetYTD: Math.round(annualBudget * (currentMonth / 12) * 100) / 100,
        spentYTD,
        committedPending,
        available: Math.round(available * 100) / 100,
        percentUsed,
        budgetStatus,
        varianceFromPlan: Math.round((spentYTD - expectedBudgetUsedByNow) * 100) / 100,
      },
      topOtEmployees: [
        { employeeId: 'emp-001', name: 'John Smith', otHoursYTD: 42.5, otCostYTD: 2301.05 },
        { employeeId: 'emp-005', name: 'Lisa Park', otHoursYTD: 38.0, otCostYTD: 2059.08 },
        { employeeId: 'emp-008', name: 'Carlos Mendez', otHoursYTD: 31.5, otCostYTD: 1706.22 },
      ],
      alerts:
        spentYTD > annualBudget * 0.8
          ? [
              {
                severity: 'WARNING',
                message: 'OT budget is 80%+ utilized with months remaining in fiscal year',
              },
            ]
          : [],
      generatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: budgetData,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to get OT budget status',
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
