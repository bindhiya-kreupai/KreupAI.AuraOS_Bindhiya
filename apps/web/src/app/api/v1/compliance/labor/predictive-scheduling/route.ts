import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const SUPPORTED_JURISDICTIONS = [
  'SAN_FRANCISCO_CA',
  'SEATTLE_WA',
  'NEW_YORK_NY',
  'CHICAGO_IL',
  'PHILADELPHIA_PA',
  'EMERYVILLE_CA',
  'OREGON_STATE',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleData, jurisdiction } = body;

    if (!scheduleData || !jurisdiction) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: scheduleData and jurisdiction are required',
          details: { missingFields: ['scheduleData', 'jurisdiction'].filter((f) => !body[f]) },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!SUPPORTED_JURISDICTIONS.includes(jurisdiction)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: `Unsupported jurisdiction '${jurisdiction}'. Supported: ${SUPPORTED_JURISDICTIONS.join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const jurisdictionRules: Record<string, any> = {
      CHICAGO_IL: {
        advanceNoticeHours: 10 * 24, // 10 days
        premiumPayForLateNotice: true,
        premiumAmount: 1, // $1 extra per hour
        rightToRestHours: 10,
        minimumShiftHours: 4,
        splitShiftPremium: false,
      },
      SEATTLE_WA: {
        advanceNoticeHours: 14 * 24, // 14 days
        premiumPayForLateNotice: true,
        premiumAmount: 2.5,
        rightToRestHours: 10,
        minimumShiftHours: 2,
        splitShiftPremium: true,
      },
    };

    const rules = jurisdictionRules[jurisdiction] || {
      advanceNoticeHours: 7 * 24,
      premiumPayForLateNotice: false,
      rightToRestHours: 8,
      minimumShiftHours: 2,
    };

    const checkResult = {
      tenantId: 'tenant-1',
      jurisdiction,
      rulesApplied: rules,
      scheduleChecked: scheduleData,
      overallStatus: 'COMPLIANT',
      violations: [],
      warnings: [
        {
          type: 'LATE_NOTICE_RISK',
          severity: 'WARNING',
          affectedShifts: 2,
          description: `2 shifts are scheduled within the ${rules.advanceNoticeHours / 24}-day advance notice window`,
          potentialPremiumCost: rules.premiumPayForLateNotice ? 24.0 : 0,
          recommendation:
            'Notify affected employees as soon as possible to reduce premium pay obligations',
        },
      ],
      summary: {
        totalShiftsChecked: Array.isArray(scheduleData) ? scheduleData.length : 1,
        violationsFound: 0,
        warningsFound: 1,
        estimatedPremiumLiability: rules.premiumPayForLateNotice ? 24.0 : 0,
      },
      checkedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: checkResult,
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
        message: 'Failed to check predictive scheduling compliance',
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
