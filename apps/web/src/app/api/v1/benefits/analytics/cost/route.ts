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

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('benefits/analytics:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing benefits/analytics:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '2026';
    const periodType = searchParams.get('periodType') || 'YEAR';

    const costAnalysis = {
      tenantId: 'tenant-1',
      period,
      periodType,
      generatedAt: new Date().toISOString(),
      totalBenefitsCost: {
        employerCost: 2845320.0,
        employeeCost: 412800.0,
        totalCost: 3258120.0,
        perEmployeePerMonth: 817.04,
        yearOverYearChange: 6.8, // percent
      },
      costByBenefitType: [
        {
          benefitType: 'MEDICAL',
          employerCost: 2180450.0,
          employeeCost: 320100.0,
          totalCost: 2500550.0,
          percentOfTotal: 76.7,
          perEmployeePerMonth: 626.62,
          yoyChange: 7.2,
        },
        {
          benefitType: 'DENTAL',
          employerCost: 285600.0,
          employeeCost: 48200.0,
          totalCost: 333800.0,
          percentOfTotal: 10.2,
          perEmployeePerMonth: 83.58,
          yoyChange: 3.1,
        },
        {
          benefitType: 'VISION',
          employerCost: 82400.0,
          employeeCost: 14500.0,
          totalCost: 96900.0,
          percentOfTotal: 2.97,
          perEmployeePerMonth: 24.27,
          yoyChange: 1.8,
        },
        {
          benefitType: 'LIFE_INSURANCE',
          employerCost: 145200.0,
          employeeCost: 0,
          totalCost: 145200.0,
          percentOfTotal: 4.46,
          perEmployeePerMonth: 36.37,
          yoyChange: 0.5,
        },
        {
          benefitType: 'DISABILITY',
          employerCost: 151670.0,
          employeeCost: 30000.0,
          totalCost: 181670.0,
          percentOfTotal: 5.57,
          perEmployeePerMonth: 45.5,
          yoyChange: 4.2,
        },
      ],
      costDrivers: [
        { driver: 'Pharmacy costs', impact: 'HIGH', percentOfMedical: 22.4, yoyChange: 12.1 },
        { driver: 'Specialist visits', impact: 'MEDIUM', percentOfMedical: 18.7, yoyChange: 5.3 },
        {
          driver: 'Mental health services',
          impact: 'MEDIUM',
          percentOfMedical: 9.2,
          yoyChange: 18.5,
        },
        { driver: 'Preventive care', impact: 'LOW', percentOfMedical: 7.1, yoyChange: -2.1 },
      ],
      savingsOpportunities: [
        {
          opportunity: 'Generic drug substitution program',
          estimatedSavings: 58000,
          difficulty: 'LOW',
        },
        {
          opportunity: 'Wellness incentive expansion',
          estimatedSavings: 35000,
          difficulty: 'MEDIUM',
        },
        {
          opportunity: 'Telemedicine utilization increase',
          estimatedSavings: 42000,
          difficulty: 'LOW',
        },
      ],
    };

    const response: ApiResponse = {
      success: true,
      data: costAnalysis,
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
        message: 'Failed to generate benefits cost analysis',
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
