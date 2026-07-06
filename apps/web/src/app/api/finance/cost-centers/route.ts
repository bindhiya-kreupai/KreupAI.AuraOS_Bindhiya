/**
 * Cost Centers API — Finance Module (AURA-155)
 * Backed by the existing aura_cost_center table (shared reference data; the
 * table has no tenantId column, so results are org-wide by design).
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { CostCenterRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const { searchParams } = new URL(request.url);
  const fiscalYear = searchParams.get('fiscalYear')
    ? Number(searchParams.get('fiscalYear'))
    : undefined;
  const result = await CostCenterRepo.list((auth as any).tenantId, { fiscalYear });
  return NextResponse.json({
    success: true,
    costCenters: result.items,
    ...result,
    summary: {
      totalCostCenters: result.total,
      totalAllocated: result.items.reduce(
        (s: number, c: any) => s + Number(c.allocatedBudget || 0),
        0
      ),
      totalSpent: result.items.reduce((s: number, c: any) => s + Number(c.spentBudget || 0), 0),
    },
  });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.name) {
    return NextResponse.json(
      { success: false, message: 'name is required.', messageAr: 'الاسم مطلوب.' },
      { status: 400 }
    );
  }
  const costCenter = await CostCenterRepo.create((auth as any).userId, body);
  return NextResponse.json({ success: true, costCenter }, { status: 201 });
});
