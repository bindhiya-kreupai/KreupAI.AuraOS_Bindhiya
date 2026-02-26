import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export async function GET(request: NextRequest, { params }: { params: { scheduleId: string } }) {
  try {
    const { scheduleId } = params;

    // Simulated schedule lookup with tenant isolation
    const knownSchedules = ['sched-001', 'sched-002', 'sched-003'];
    if (!knownSchedules.includes(scheduleId)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Schedule with id '${scheduleId}' not found`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const fairnessAnalysis = {
      tenantId: 'tenant-1',
      scheduleId,
      overallFairnessScore: 88.5,
      rating: 'GOOD', // POOR, FAIR, GOOD, EXCELLENT
      period: {
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      },
      metrics: {
        hoursDistribution: {
          score: 91.2,
          giniCoefficient: 0.08,
          standardDeviation: 2.4,
          min: 36,
          max: 44,
          average: 40.1,
          description: 'Hours are well-distributed across team members',
        },
        weekendEquity: {
          score: 85.0,
          averageWeekendsPerEmployee: 1.8,
          standardDeviation: 0.6,
          description: 'Weekend assignments are reasonably balanced',
        },
        preferenceAccommodation: {
          score: 78.3,
          requestsFulfilled: 34,
          requestsTotal: 42,
          fulfillmentRate: 80.9,
          description: '81% of employee shift preferences were accommodated',
        },
        holidayEquity: {
          score: 95.0,
          description: 'Holiday assignments are equally distributed',
        },
        shiftTypeBalance: {
          score: 89.5,
          distribution: {
            morning: { average: 14.2, stdDev: 1.8 },
            afternoon: { average: 11.8, stdDev: 2.1 },
            evening: { average: 4.5, stdDev: 1.2 },
          },
        },
      },
      employeeScores: [
        {
          employeeId: 'emp-001',
          name: 'John Smith',
          hoursScheduled: 40,
          weekends: 2,
          holidaysWorked: 0,
          fairnessScore: 92.0,
        },
        {
          employeeId: 'emp-002',
          name: 'Maria Garcia',
          hoursScheduled: 42,
          weekends: 1,
          holidaysWorked: 1,
          fairnessScore: 83.5,
        },
        {
          employeeId: 'emp-003',
          name: 'David Lee',
          hoursScheduled: 38,
          weekends: 2,
          holidaysWorked: 0,
          fairnessScore: 87.0,
        },
      ],
      inequities: [
        {
          severity: 'LOW',
          type: 'WEEKEND_IMBALANCE',
          description: 'emp-002 has 1 fewer weekend assignment than average this month',
          recommendation: 'Adjust in next schedule cycle to balance cumulative weekend assignments',
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: fairnessAnalysis,
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
        message: 'Failed to get schedule fairness score',
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
