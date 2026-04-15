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
    const years = parseInt(searchParams.get('years') || '5');

    if (years < 1 || years > 10) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: years must be between 1 and 10',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const currentYear = new Date().getFullYear();
    const yearlyData = [];

    for (let i = years - 1; i >= 0; i--) {
      const year = currentYear - i;
      const basePerEmployee = 680 + (years - i - 1) * 42; // simulate growth
      yearlyData.push({
        year,
        totalCost: Math.round(basePerEmployee * 400 * 12 * 100) / 100,
        employerCost: Math.round(basePerEmployee * 0.87 * 400 * 12 * 100) / 100,
        employeeCost: Math.round(basePerEmployee * 0.13 * 400 * 12 * 100) / 100,
        perEmployeePerMonth: basePerEmployee,
        enrolledEmployees: 385 + (years - i - 1) * 8,
        medicalCost: Math.round(basePerEmployee * 0.768 * 400 * 12 * 100) / 100,
        dentalCost: Math.round(basePerEmployee * 0.102 * 400 * 12 * 100) / 100,
        visionCost: Math.round(basePerEmployee * 0.03 * 400 * 12 * 100) / 100,
        otherCost: Math.round(basePerEmployee * 0.1 * 400 * 12 * 100) / 100,
        yoyGrowthPercent:
          i === years - 1
            ? null
            : parseFloat(((basePerEmployee / (basePerEmployee - 42) - 1) * 100).toFixed(1)),
      });
    }

    const avgGrowthRate =
      yearlyData.slice(1).reduce((sum, y) => sum + (y.yoyGrowthPercent || 0), 0) /
      (yearlyData.length - 1);

    const trendsReport = {
      tenantId: 'tenant-1',
      yearsAnalyzed: years,
      generatedAt: new Date().toISOString(),
      yearlyData,
      trendSummary: {
        averageAnnualGrowthRate: Math.round(avgGrowthRate * 10) / 10,
        totalCostCAGR: Math.round(avgGrowthRate * 10) / 10,
        projectedNextYear: {
          year: currentYear + 1,
          estimatedTotalCost:
            Math.round(
              yearlyData[yearlyData.length - 1].totalCost * (1 + avgGrowthRate / 100) * 100
            ) / 100,
          estimatedPerEmployee: Math.round(
            yearlyData[yearlyData.length - 1].perEmployeePerMonth * (1 + avgGrowthRate / 100)
          ),
        },
      },
      industryBenchmark: {
        averageAnnualGrowth: 6.5,
        companyVsBenchmark: Math.round((avgGrowthRate - 6.5) * 10) / 10,
        benchmarkSource: 'Mercer National Survey of Employer-Sponsored Health Plans',
      },
    };

    const response: ApiResponse = {
      success: true,
      data: trendsReport,
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
        message: 'Failed to generate benefits cost trends',
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
