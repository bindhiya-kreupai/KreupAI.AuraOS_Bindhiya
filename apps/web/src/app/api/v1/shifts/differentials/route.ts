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

const differentialRates: Record<string, any[]> = {
  DEFAULT: [
    {
      id: 'diff-001',
      name: 'Evening Differential',
      shiftType: 'EVENING',
      timeRange: { start: '18:00', end: '22:00' },
      differentialType: 'FLAT_AMOUNT',
      amount: 1.5,
      percentAmount: null,
      applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      eligibleRoles: null, // null means all roles
      status: 'ACTIVE',
    },
    {
      id: 'diff-002',
      name: 'Night Differential',
      shiftType: 'NIGHT',
      timeRange: { start: '22:00', end: '06:00' },
      differentialType: 'FLAT_AMOUNT',
      amount: 3.0,
      percentAmount: null,
      applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      eligibleRoles: null,
      status: 'ACTIVE',
    },
    {
      id: 'diff-003',
      name: 'Weekend Differential',
      shiftType: 'WEEKEND',
      timeRange: null,
      differentialType: 'PERCENTAGE',
      amount: null,
      percentAmount: 10, // 10% of base hourly rate
      applicableDays: ['SATURDAY', 'SUNDAY'],
      eligibleRoles: null,
      status: 'ACTIVE',
    },
    {
      id: 'diff-004',
      name: 'Holiday Differential',
      shiftType: 'HOLIDAY',
      timeRange: null,
      differentialType: 'MULTIPLIER',
      amount: null,
      percentAmount: null,
      multiplier: 1.5, // 1.5x base rate
      applicableDays: null, // applies to all days designated as holidays
      eligibleRoles: null,
      status: 'ACTIVE',
    },
    {
      id: 'diff-005',
      name: 'On-Call Response Differential',
      shiftType: 'ON_CALL',
      timeRange: null,
      differentialType: 'FLAT_AMOUNT',
      amount: 2.0,
      percentAmount: null,
      applicableDays: null,
      eligibleRoles: ['Senior Engineer', 'DevOps Engineer'],
      status: 'ACTIVE',
    },
  ],
  CALIFORNIA: [
    {
      id: 'diff-ca-001',
      name: 'Split Shift Premium (CA)',
      shiftType: 'SPLIT',
      timeRange: null,
      differentialType: 'FLAT_AMOUNT',
      amount: 10.5, // CA minimum wage hourly premium
      percentAmount: null,
      applicableDays: null,
      eligibleRoles: null,
      status: 'ACTIVE',
      regulatoryBasis: 'California IWC Wage Orders',
    },
  ],
};

export const GET = withEnhancedAuth(async (request: NextRequest, { _user }: any) => {
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const jurisdiction = searchParams.get('jurisdiction') || 'DEFAULT';

    const rates = [
      ...(differentialRates['DEFAULT'] || []),
      ...(differentialRates[jurisdiction.toUpperCase()] && jurisdiction.toUpperCase() !== 'DEFAULT'
        ? differentialRates[jurisdiction.toUpperCase()]
        : []),
    ];

    const response: ApiResponse = {
      success: true,
      data: rates,
      meta: {
        jurisdiction: jurisdiction.toUpperCase(),
        totalRates: rates.length,
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
        message: 'Failed to get shift differential rates',
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
