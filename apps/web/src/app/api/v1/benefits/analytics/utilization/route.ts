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

export const GET = withEnhancedAuth(async (request: NextRequest, { _user }: any) => {
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '2026-Q1';
    const periodType = searchParams.get('periodType') || 'QUARTER'; // QUARTER, MONTH, YEAR

    const utilizationReport = {
      tenantId: 'tenant-1',
      period,
      periodType,
      generatedAt: new Date().toISOString(),
      summary: {
        totalEmployeesEnrolled: 298,
        totalClaims: 1842,
        totalClaimedAmount: 487320.5,
        planPaidAmount: 396280.4,
        memberPaidAmount: 91040.1,
        averageClaimAmount: 264.56,
        utilizationRate: 78.2, // percent of enrolled members who filed at least one claim
      },
      byBenefitType: [
        {
          benefitType: 'MEDICAL',
          claims: 1250,
          claimedAmount: 380200.0,
          planPaid: 312450.0,
          memberPaid: 67750.0,
          utilizationRate: 82.4,
          topDiagnosisCategories: [
            { category: 'Musculoskeletal', claimCount: 220, amount: 85400.0 },
            { category: 'Preventive Care', claimCount: 315, amount: 42100.0 },
            { category: 'Respiratory', claimCount: 185, amount: 28700.0 },
          ],
        },
        {
          benefitType: 'DENTAL',
          claims: 420,
          claimedAmount: 68450.5,
          planPaid: 54760.4,
          memberPaid: 13690.1,
          utilizationRate: 71.5,
          topProcedureCategories: [
            { category: 'Preventive', claimCount: 198, amount: 15800.0 },
            { category: 'Basic Restorative', claimCount: 145, amount: 32100.0 },
            { category: 'Major Restorative', claimCount: 42, amount: 18400.0 },
          ],
        },
        {
          benefitType: 'VISION',
          claims: 172,
          claimedAmount: 38670.0,
          planPaid: 29070.0,
          memberPaid: 9600.0,
          utilizationRate: 58.1,
        },
      ],
      monthlyTrend: [
        { month: '2026-01', claims: 612, amount: 162440.17 },
        { month: '2026-02', claims: 580, amount: 154200.33 },
        { month: '2026-03', claims: 650, amount: 170680.0 },
      ],
      highUtilizationEmployees: {
        count: 12,
        threshold: 5000,
        note: 'Employees with claims exceeding $5,000 this period. Individual data requires HR authorization.',
      },
    };

    const response: ApiResponse = {
      success: true,
      data: utilizationReport,
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
        message: 'Failed to generate benefits utilization report',
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
