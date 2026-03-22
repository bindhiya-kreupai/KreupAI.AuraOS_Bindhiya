import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/compliance/labor/meal-breaks
 * Check meal/rest break compliance for a shift
 */
export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { employeeId, shiftData, jurisdiction } = body;

    if (!employeeId || !shiftData || !jurisdiction) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed: employeeId, shiftData, and jurisdiction are required',
            details: {
              missingFields: ['employeeId', 'shiftData', 'jurisdiction'].filter((f) => !body[f]),
            },
          },
          meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 400 }
      );
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

    const shiftHours = shiftData.hours || 8;
    const mealBreaksTaken = shiftData.mealBreaks || [];
    const restBreaksTaken = shiftData.restBreaks || [];

    const violations: Array<{ type: string; severity: string; count: number; description: string; rule: string }> = [];
    const penalties: Array<{ type: string; hoursOwed: number; description: string }> = [];

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

    if (
      rules.restBreak &&
      rules.restBreak.requiredEveryHours &&
      shiftHours >= rules.restBreak.requiredEveryHours
    ) {
      const expectedRestBreaks = Math.floor(shiftHours / rules.restBreak.requiredEveryHours);
      if (restBreaksTaken.length < expectedRestBreaks) {
        const missedRest = expectedRestBreaks - restBreaksTaken.length;
        violations.push({
          type: 'MISSED_REST_BREAK',
          severity: 'MEDIUM',
          count: missedRest,
          description: `${missedRest} required rest break(s) not taken. Required every ${rules.restBreak.requiredEveryHours} hours.`,
          rule: `${jurisdiction} Labor Code`,
        });
        if (rules.restBreak.paidPenaltyIfMissed) {
          penalties.push({
            type: 'REST_BREAK_PREMIUM',
            hoursOwed: missedRest * (rules.restBreak.penaltyHours || 1),
            description: `${missedRest} rest break premium payment(s) owed at regular rate`,
          });
        }
      }
    }

    const result = {
      tenantId: user.tenantId,
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
      totalPenaltyHours: penalties.reduce((sum, p) => sum + (p.hoursOwed || 0), 0),
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Meal Breaks API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to detect meal break violations',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.REPORT_GENERATED,
  resourceType: 'meal_break_compliance',
  captureRequestBody: true,
});
