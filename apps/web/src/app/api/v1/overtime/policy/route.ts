import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const overtimePolicies: Record<string, any> = {
  FEDERAL: {
    jurisdiction: 'FEDERAL',
    standard: 'FLSA',
    weeklyThreshold: 40,
    dailyThreshold: null,
    rate: 1.5,
    doubleTimeThreshold: null,
    doubleTimeRate: null,
    sevenConsecutiveDayRate: null,
    exemptions: [
      'Executive',
      'Administrative',
      'Professional',
      'Outside Sales',
      'Computer Employees',
    ],
    salaryLevelTest: 684, // $684/week threshold as of 2020; check for updates
    salaryBasisTest: true,
    dutyTest: true,
  },
  CALIFORNIA: {
    jurisdiction: 'CALIFORNIA',
    standard: 'CA Labor Code Section 510',
    weeklyThreshold: 40,
    dailyThreshold: 8, // OT after 8 hours in a day
    rate: 1.5,
    doubleTimeThreshold: { daily: 12, weekly: null, seventhDay: 8 },
    doubleTimeRate: 2.0,
    sevenConsecutiveDayRate: 1.5, // first 8 hours on 7th consecutive day
    sevenConsecutiveDayDoubleTimeRate: 2.0, // over 8 hours on 7th consecutive day
    compTimeAllowed: false,
    salaryLevelTest: 1120, // twice CA minimum wage * 2080 / 52
  },
  NEVADA: {
    jurisdiction: 'NEVADA',
    standard: 'NRS Chapter 608',
    weeklyThreshold: 40,
    dailyThreshold: 8,
    rate: 1.5,
    doubleTimeThreshold: null,
    doubleTimeRate: null,
    dailyOTExemption: 'If employee earns 1.5x minimum wage, daily OT not required',
  },
};

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
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
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const jurisdiction = (searchParams.get('jurisdiction') || 'FEDERAL').toUpperCase();

    const policy = overtimePolicies[jurisdiction];

    if (!policy) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Overtime policy for jurisdiction '${jurisdiction}' not found. Available: ${Object.keys(overtimePolicies).join(', ')}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        ...policy,
        tenantCustomizations: {
          compTimeAllowed: false,
          preApprovalRequired: true,
          preApprovalHoursThreshold: 2,
          budgetAlertThreshold: 80, // percent of OT budget
          managerNotificationEnabled: true,
        },
        lastUpdated: '2026-01-01T00:00:00.000Z',
      },
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
        message: 'Failed to get overtime policy',
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
