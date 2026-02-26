import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, shiftData, jurisdiction } = body;

    if (!employeeId || !shiftData || !jurisdiction) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: employeeId, shiftData, and jurisdiction are required',
          details: {
            missingFields: ['employeeId', 'shiftData', 'jurisdiction'].filter((f) => !body[f]),
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Jurisdiction-based meal break rules
    const jurisdictionRules: Record<string, any> = {
      CALIFORNIA: {
        mealBreak: {
          requiredAfterHours: 5,
          durationMinutes: 30,
          paidPenaltyIfMissed: true,
          penaltyHours: 1,
        },
        restBreak: {
          requiredEveryHours: 4,
          durationMinutes: 10,
          paidPenaltyIfMissed: true,
          penaltyHours: 1,
        },
      },
      NEW_YORK: {
        mealBreak: { requiredAfterHours: 6, durationMinutes: 30, paidPenaltyIfMissed: false },
        restBreak: null,
      },
      FEDERAL: {
        mealBreak: {
          requiredAfterHours: null,
          durationMinutes: 30,
          unpaidIfOver30: true,
          paidPenaltyIfMissed: false,
        },
        restBreak: { requiredEveryHours: null, durationMinutes: 20, paid: true },
      },
    };

    const rules = jurisdictionRules[jurisdiction.toUpperCase()] || jurisdictionRules['FEDERAL'];

    // Mock violation detection
    const shiftHours = shiftData.hours || 8;
    const mealBreaksTaken = shiftData.mealBreaks || [];
    const restBreaksTaken = shiftData.restBreaks || [];

    const violations = [];
    const penalties = [];

    if (
      rules.mealBreak &&
      rules.mealBreak.requiredAfterHours &&
      shiftHours >= rules.mealBreak.requiredAfterHours
    ) {
      const expectedMealBreaks = Math.floor(shiftHours / rules.mealBreak.requiredAfterHours);
      if (mealBreaksTaken.length < expectedMealBreaks) {
        const missedBreaks = expectedMealBreaks - mealBreaksTaken.length;
        violations.push({
          type: 'MISSED_MEAL_BREAK',
          severity: 'HIGH',
          count: missedBreaks,
          description: `${missedBreaks} required meal break(s) not taken. Required after every ${rules.mealBreak.requiredAfterHours} hours.`,
          rule: `${jurisdiction} Labor Code`,
        });
        if (rules.mealBreak.paidPenaltyIfMissed) {
          penalties.push({
            type: 'MEAL_BREAK_PREMIUM',
            hoursOwed: missedBreaks * rules.mealBreak.penaltyHours,
            description: `${missedBreaks} meal break premium payment(s) owed at regular rate`,
          });
        }
      }
    }

    const result = {
      tenantId: 'tenant-1',
      employeeId,
      jurisdiction,
      rulesApplied: rules,
      shiftSummary: {
        shiftHours,
        mealBreaksTaken: mealBreaksTaken.length,
        restBreaksTaken: restBreaksTaken.length,
      },
      complianceStatus: violations.length === 0 ? 'COMPLIANT' : 'VIOLATION',
      violations,
      penalties,
      totalPenaltyHours: penalties.reduce((sum: number, p: any) => sum + (p.hoursOwed || 0), 0),
      checkedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: result,
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
        message: 'Failed to detect meal break violations',
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
