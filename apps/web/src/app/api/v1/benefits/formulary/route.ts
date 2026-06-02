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

const mockFormularyData = [
  {
    drugId: 'drug-001',
    brandName: 'Lipitor',
    genericName: 'Atorvastatin',
    strength: ['10mg', '20mg', '40mg', '80mg'],
    dosageForms: ['tablet'],
    therapeuticClass: 'Statins (HMG-CoA Reductase Inhibitors)',
    tier: 2,
    tierName: 'Preferred Generic',
    requiresPriorAuth: false,
    requiresStepTherapy: false,
    quantityLimits: { daysSupply: 30, maxQuantity: 30 },
    cost: { copay30Day: 25, copay90Day: 62, coinsurance: null },
    preferredAlternatives: ['atorvastatin calcium (generic)'],
    NDC: '0071-0155-23',
  },
  {
    drugId: 'drug-002',
    brandName: 'Metformin HCl',
    genericName: 'Metformin Hydrochloride',
    strength: ['500mg', '850mg', '1000mg'],
    dosageForms: ['tablet', 'extended-release tablet'],
    therapeuticClass: 'Biguanides / Antidiabetic Agents',
    tier: 1,
    tierName: 'Generic',
    requiresPriorAuth: false,
    requiresStepTherapy: false,
    quantityLimits: { daysSupply: 30, maxQuantity: 60 },
    cost: { copay30Day: 10, copay90Day: 25, coinsurance: null },
    preferredAlternatives: [],
    NDC: '0093-1048-01',
  },
  {
    drugId: 'drug-003',
    brandName: 'Humira',
    genericName: 'Adalimumab',
    strength: ['40mg/0.8mL'],
    dosageForms: ['solution for injection'],
    therapeuticClass: 'Tumor Necrosis Factor Blockers',
    tier: 5,
    tierName: 'Specialty',
    requiresPriorAuth: true,
    requiresStepTherapy: true,
    quantityLimits: { daysSupply: 30, maxQuantity: 2 },
    cost: { copay30Day: null, copay90Day: null, coinsurance: 0.2 },
    preferredAlternatives: ['Hadlima (adalimumab-bwwd)', 'Hyrimoz (adalimumab-adaz)'],
    specialtyPharmacyRequired: true,
    NDC: '0074-3799-02',
  },
];

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('benefits/formulary:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing benefits/formulary:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    // Simulated tenant isolation: tenantId would come from validated JWT
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const drugName = searchParams.get('drugName') || '';
    const tier = searchParams.get('tier') ? parseInt(searchParams.get('tier')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (!planId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed: planId query parameter is required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    let drugs = [...mockFormularyData];

    if (drugName) {
      const lq = drugName.toLowerCase();
      drugs = drugs.filter(
        (d) =>
          d.brandName.toLowerCase().includes(lq) ||
          d.genericName.toLowerCase().includes(lq) ||
          d.NDC.includes(lq)
      );
    }

    if (tier !== undefined) {
      drugs = drugs.filter((d) => d.tier === tier);
    }

    const total = drugs.length;
    const paginated = drugs.slice((page - 1) * limit, page * limit);

    const response: ApiResponse = {
      success: true,
      data: paginated,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        planId,
        tierLegend: {
          1: 'Generic',
          2: 'Preferred Generic',
          3: 'Preferred Brand',
          4: 'Non-Preferred Brand',
          5: 'Specialty',
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to lookup formulary',
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
