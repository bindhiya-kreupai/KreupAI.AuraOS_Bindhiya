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
  if (!permissions.includes('benefits/compliance:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing benefits/compliance:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const acaStatus = {
      tenantId: 'tenant-1',
      reportingYear: year,
      applicableLargeEmployer: true,
      ale: {
        fteThreshold: 50,
        averageFTE: 312.5,
        status: 'ALE',
        determinationMonth: 'November',
        priorYear: year - 1,
      },
      offerOfCoverage: {
        minimumEssentialCoverage: true,
        minimumValueCoverage: true,
        affordabilityPercentage: 9.12,
        affordableUnderSafeHarbor: 'W2',
        lowestCostEmployeePremium: 125.0,
        affordabilityStatus: 'AFFORDABLE',
      },
      fullTimeEmployeeCount: {
        jan: 315,
        feb: 318,
        mar: 320,
        apr: 322,
        may: 319,
        jun: 316,
        jul: 310,
        aug: 308,
        sep: 311,
        oct: 314,
        nov: 312,
        dec: 309,
        average: 312.8,
      },
      reportingStatus: {
        form1094C: { status: 'FILED', filedDate: `${year}-02-28`, transmittalId: `T${year}-001` },
        form1095C: {
          status: 'DISTRIBUTED',
          distributedDate: `${year}-01-31`,
          totalForms: 315,
          electronicForms: 210,
          paperForms: 105,
        },
      },
      penalties: {
        potentialSection4980HPenalty: 0,
        potentialSection4980HPenalty2: 0,
        penaltyStatus: 'NO_PENALTY',
      },
      openIssues: [
        {
          id: 'aca-issue-001',
          severity: 'WARNING',
          description: '4 employees missing W-2 safe harbor data for affordability calculation',
          affectedEmployees: 4,
          action: 'Verify payroll data completeness for affected employees',
        },
      ],
      lastAuditDate: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: acaStatus,
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
        message: 'Failed to fetch ACA compliance status',
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
