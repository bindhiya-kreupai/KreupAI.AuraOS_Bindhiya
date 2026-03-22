import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const dynamic = 'force-dynamic';

const SUPPORTED_JURISDICTIONS = [
  'SAN_FRANCISCO_CA',
  'SEATTLE_WA',
  'NEW_YORK_NY',
  'CHICAGO_IL',
  'PHILADELPHIA_PA',
  'EMERYVILLE_CA',
  'OREGON_STATE',
];

/**
 * POST /api/v1/compliance/labor/predictive-scheduling
 * Check predictive scheduling compliance
 */
export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { scheduleData, jurisdiction } = body;

    if (!scheduleData || !jurisdiction) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed: scheduleData and jurisdiction are required',
            details: { missingFields: ['scheduleData', 'jurisdiction'].filter((f) => !body[f]) },
          },
          meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 400 }
      );
    }

    if (!SUPPORTED_JURISDICTIONS.includes(jurisdiction)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: `Unsupported jurisdiction '${jurisdiction}'. Supported: ${SUPPORTED_JURISDICTIONS.join(', ')}`,
          },
          meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 400 }
      );
    }

    const jurisdictionRules: Record<string, any> = {
      SAN_FRANCISCO_CA: {
        advanceNoticeHours: 14 * 24,
        premiumPayForLateNotice: true,
        premiumAmount: 2.0,
        rightToRestHours: 11,
        minimumShiftHours: 2,
        splitShiftPremium: true,
      },
      CHICAGO_IL: {
        advanceNoticeHours: 10 * 24,
        premiumPayForLateNotice: true,
        premiumAmount: 1.0,
        rightToRestHours: 10,
        minimumShiftHours: 4,
        splitShiftPremium: false,
      },
      SEATTLE_WA: {
        advanceNoticeHours: 14 * 24,
        premiumPayForLateNotice: true,
        premiumAmount: 2.5,
        rightToRestHours: 10,
        minimumShiftHours: 2,
        splitShiftPremium: true,
      },
      NEW_YORK_NY: {
        advanceNoticeHours: 14 * 24,
        premiumPayForLateNotice: true,
        premiumAmount: 2.0,
        rightToRestHours: 11,
        minimumShiftHours: 2,
        splitShiftPremium: false,
      },
      PHILADELPHIA_PA: {
        advanceNoticeHours: 10 * 24,
        premiumPayForLateNotice: true,
        premiumAmount: 1.5,
        rightToRestHours: 9,
        minimumShiftHours: 2,
        splitShiftPremium: false,
      },
      EMERYVILLE_CA: {
        advanceNoticeHours: 14 * 24,
        premiumPayForLateNotice: true,
        premiumAmount: 2.0,
        rightToRestHours: 11,
        minimumShiftHours: 2,
        splitShiftPremium: true,
      },
      OREGON_STATE: {
        advanceNoticeHours: 14 * 24,
        premiumPayForLateNotice: true,
        premiumAmount: 1.0,
        rightToRestHours: 10,
        minimumShiftHours: 2,
        splitShiftPremium: false,
      },
    };

    const rules = jurisdictionRules[jurisdiction] || {
      advanceNoticeHours: 7 * 24,
      premiumPayForLateNotice: false,
      rightToRestHours: 8,
      minimumShiftHours: 2,
    };

    const shifts = Array.isArray(scheduleData) ? scheduleData : [scheduleData];
    const now = Date.now();
    const violations: Array<{ type: string; severity: string; shiftId?: string; description: string; premiumCost: number }> = [];
    const warnings: Array<{ type: string; severity: string; affectedShifts: number; description: string; potentialPremiumCost: number; recommendation: string }> = [];

    // Check advance notice
    let lateNoticeCount = 0;
    let premiumLiability = 0;

    for (const shift of shifts) {
      const shiftStart = shift.startTime ? new Date(shift.startTime).getTime() : 0;
      const hoursUntilShift = (shiftStart - now) / (1000 * 60 * 60);

      if (shiftStart > 0 && hoursUntilShift < rules.advanceNoticeHours && hoursUntilShift > 0) {
        lateNoticeCount++;
        if (rules.premiumPayForLateNotice) {
          const shiftHours = shift.durationHours || 8;
          premiumLiability += shiftHours * rules.premiumAmount;
        }
      }
    }

    if (lateNoticeCount > 0) {
      warnings.push({
        type: 'LATE_NOTICE_RISK',
        severity: 'WARNING',
        affectedShifts: lateNoticeCount,
        description: `${lateNoticeCount} shift(s) scheduled within the ${rules.advanceNoticeHours / 24}-day advance notice window`,
        potentialPremiumCost: premiumLiability,
        recommendation: 'Notify affected employees as soon as possible to reduce premium pay obligations',
      });
    }

    const checkResult = {
      tenantId: user.tenantId,
      jurisdiction,
      rulesApplied: rules,
      overallStatus: violations.length > 0 ? 'VIOLATION' : 'COMPLIANT',
      violations,
      warnings,
      summary: {
        totalShiftsChecked: shifts.length,
        violationsFound: violations.length,
        warningsFound: warnings.length,
        estimatedPremiumLiability: premiumLiability,
      },
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: checkResult,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Predictive Scheduling API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to check predictive scheduling compliance',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.REPORT_GENERATED,
  resourceType: 'predictive_scheduling',
  captureRequestBody: true,
});
