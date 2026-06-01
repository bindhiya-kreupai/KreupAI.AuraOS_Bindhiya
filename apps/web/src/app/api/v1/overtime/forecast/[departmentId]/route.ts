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
    const weeksAhead = Math.min(parseInt(searchParams.get('weeksAhead') || '4'), 12);

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

    const weeklyForecasts = [];
    const baseDate = new Date();

    for (let i = 0; i < weeksAhead; i++) {
      const weekStart = new Date(baseDate);
      weekStart.setDate(weekStart.getDate() + i * 7 - weekStart.getDay() + 1);
      const projectedOtHours = 12 + Math.round(Math.random() * 20);
      const avgOtRate = 54.09; // 1.5x of $36.06

      weeklyForecasts.push({
        weekOf: weekStart.toISOString().split('T')[0],
        projectedOvertimeHours: projectedOtHours,
        projectedOvertimeCost: Math.round(projectedOtHours * avgOtRate * 100) / 100,
        riskLevel: projectedOtHours > 25 ? 'HIGH' : projectedOtHours > 15 ? 'MEDIUM' : 'LOW',
        drivers: i === 0 ? ['Planned project deadline', 'Leave coverage'] : ['Normal operations'],
        preApprovedHours: Math.max(0, projectedOtHours - 8),
        budgetImpact: projectedOtHours > 20 ? 'OVER_BUDGET' : 'WITHIN_BUDGET',
      });
    }

    const totalForecastHours = weeklyForecasts.reduce(
      (sum, w) => sum + w.projectedOvertimeHours,
      0
    );
    const totalForecastCost = weeklyForecasts.reduce((sum, w) => sum + w.projectedOvertimeCost, 0);

    const forecast = {
      tenantId: 'tenant-1',
      departmentId,
      departmentName: departmentId
        .replace('dept-', '')
        .replace('-', ' ')
        .replace(/\b\w/g, (l: any) => l.toUpperCase()),
      weeksAhead,
      generatedAt: new Date().toISOString(),
      summary: {
        totalProjectedOtHours: totalForecastHours,
        totalProjectedOtCost: Math.round(totalForecastCost * 100) / 100,
        averageWeeklyOtHours: Math.round((totalForecastHours / weeksAhead) * 10) / 10,
        riskWeeks: weeklyForecasts.filter((w) => w.riskLevel === 'HIGH').length,
      },
      weeklyForecasts,
      recommendations:
        totalForecastHours > 80
          ? [
              {
                priority: 'HIGH',
                action:
                  'Consider temporary headcount increase or contract workers to reduce OT exposure',
              },
            ]
          : [{ priority: 'LOW', action: 'OT levels within acceptable range; continue monitoring' }],
    };

    const response: ApiResponse = {
      success: true,
      data: forecast,
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
        message: 'Failed to get OT forecast',
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
