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

const VALID_SCENARIO_TYPES = [
  'HEADCOUNT_CHANGE',
  'DEMAND_SPIKE',
  'DEMAND_DROP',
  'ABSENCE_INCREASE',
  'NEW_SHIFT_PATTERN',
  'BUDGET_REDUCTION',
  'SKILL_MIX_CHANGE',
];

export const POST = withEnhancedAuth(async (request: NextRequest, { _user }: any) => {
  try {
    const body = await request.json();
    const { scenarioType, parameters } = body;

    if (!scenarioType || !parameters) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: scenarioType and parameters are required',
          details: { missingFields: ['scenarioType', 'parameters'].filter((f) => !body[f]) },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!VALID_SCENARIO_TYPES.includes(scenarioType)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Invalid scenarioType. Must be one of: ${VALID_SCENARIO_TYPES.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Mock what-if analysis
    const scenarioResult = {
      id: `scenario-${crypto.randomUUID().slice(0, 8)}`,
      tenantId: 'tenant-1',
      scenarioType,
      parameters,
      baseline: {
        weeklyHours: 320,
        staffCount: 40,
        overtimeHours: 8,
        laborCost: 48000,
        coverageScore: 94.5,
        employeeSatisfactionIndex: 82,
      },
      projected: {
        weeklyHours:
          scenarioType === 'HEADCOUNT_CHANGE'
            ? 320 + (parameters.headcountChange || 0) * 8
            : scenarioType === 'DEMAND_SPIKE'
              ? 320 * (1 + (parameters.demandIncrease || 0) / 100)
              : 320,
        staffCount:
          40 + (scenarioType === 'HEADCOUNT_CHANGE' ? parameters.headcountChange || 0 : 0),
        overtimeHours:
          scenarioType === 'DEMAND_SPIKE' ? 8 + (parameters.demandIncrease || 0) * 0.5 : 8,
        laborCost:
          48000 *
          (scenarioType === 'BUDGET_REDUCTION'
            ? 1 - (parameters.reductionPercent || 0) / 100
            : 1.05),
        coverageScore:
          scenarioType === 'HEADCOUNT_CHANGE' && (parameters.headcountChange || 0) > 0
            ? 97.2
            : 89.1,
        employeeSatisfactionIndex:
          scenarioType === 'HEADCOUNT_CHANGE' && (parameters.headcountChange || 0) > 0 ? 87 : 76,
      },
      impacts: [
        {
          category: 'COST',
          impact: scenarioType === 'HEADCOUNT_CHANGE' ? 'INCREASE' : 'NEUTRAL',
          changePercent:
            scenarioType === 'HEADCOUNT_CHANGE' ? (parameters.headcountChange || 0) * 2.5 : 0,
          description: 'Estimated impact on weekly labor cost',
        },
        {
          category: 'COVERAGE',
          impact: scenarioType === 'DEMAND_SPIKE' ? 'DECREASE' : 'NEUTRAL',
          changePercent:
            scenarioType === 'DEMAND_SPIKE' ? -(parameters.demandIncrease || 0) * 0.4 : 0,
          description: 'Projected change in staffing coverage score',
        },
      ],
      recommendations: [
        {
          action: 'REVIEW_OVERTIME_POLICY',
          priority: 'MEDIUM',
          description: 'Consider pre-approving overtime for key roles to maintain coverage targets',
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: scenarioResult,
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
        message: 'Failed to run what-if scenario',
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
