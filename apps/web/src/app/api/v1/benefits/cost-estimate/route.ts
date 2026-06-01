import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const procedureCostData: Record<string, { name: string; averageCost: number; cptCode: string }> = {
  99213: {
    name: 'Office Visit - Established Patient (Level 3)',
    averageCost: 250,
    cptCode: '99213',
  },
  71046: { name: 'Chest X-Ray (2 views)', averageCost: 450, cptCode: '71046' },
  27447: { name: 'Total Knee Replacement', averageCost: 32000, cptCode: '27447' },
  43239: { name: 'Upper GI Endoscopy with Biopsy', averageCost: 2800, cptCode: '43239' },
  80061: { name: 'Lipid Panel', averageCost: 75, cptCode: '80061' },
  70553: { name: 'MRI Brain with Contrast', averageCost: 3500, cptCode: '70553' },
};

export const POST = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('benefits/cost-estimate:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing benefits/cost-estimate:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const { procedureCode, providerId, planId } = body;

    if (!procedureCode || !planId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: procedureCode and planId are required',
          details: { missingFields: ['procedureCode', 'planId'].filter((f) => !body[f]) },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const procedureInfo = procedureCostData[procedureCode];
    if (!procedureInfo) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: `Procedure code '${procedureCode}' not found in cost database`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const averageCost = procedureInfo.averageCost;
    const inNetworkCost = averageCost * 0.75; // typical negotiated rate
    const deductibleRemaining = 850.0;
    const oop_max_remaining = 3200.0;
    const coinsurance = 0.2;

    const deductibleApplied = Math.min(deductibleRemaining, inNetworkCost);
    const afterDeductible = inNetworkCost - deductibleApplied;
    const coinsuranceAmount = afterDeductible * coinsurance;
    const totalPatientResponsibility = deductibleApplied + coinsuranceAmount;

    const estimate = {
      id: `est-${crypto.randomUUID().slice(0, 8)}`,
      procedureCode,
      procedureName: procedureInfo.name,
      providerId: providerId || null,
      planId,
      tenantId: 'tenant-1',
      costBreakdown: {
        totalBilledAmount: averageCost,
        inNetworkNegotiatedRate: Math.round(inNetworkCost * 100) / 100,
        planPays: Math.round((inNetworkCost - totalPatientResponsibility) * 100) / 100,
        patientPays: Math.round(totalPatientResponsibility * 100) / 100,
        breakdown: {
          deductibleApplied: Math.round(deductibleApplied * 100) / 100,
          copay: 0,
          coinsurance: Math.round(coinsuranceAmount * 100) / 100,
          notCovered: 0,
        },
      },
      accumulatorStatus: {
        deductible: { individual: { spent: 1150, remaining: deductibleRemaining, maximum: 2000 } },
        outOfPocketMax: {
          individual: { spent: 1300, remaining: oop_max_remaining, maximum: 4500 },
        },
      },
      disclaimer:
        'This is an estimate only. Actual costs may vary based on diagnosis, additional services performed, and final claim processing. Cost information is based on average negotiated rates for in-network providers.',
      generatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: estimate,
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
        message: 'Failed to estimate procedure cost',
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
