/**
 * Budget Scenario API — Finance Module (AURA-153, AURA-158)
 * DB-backed, tenant-scoped.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { ScenarioRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (_request: NextRequest, { auth }) => {
  const result = await ScenarioRepo.list((auth as any).tenantId, {});
  return NextResponse.json({ success: true, scenarios: result.items, ...result });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.scenarioName) {
    return NextResponse.json(
      { success: false, message: 'scenarioName is required.', messageAr: 'اسم السيناريو مطلوب.' },
      { status: 400 }
    );
  }
  const scenario = await ScenarioRepo.create((auth as any).tenantId, (auth as any).userId, body);
  return NextResponse.json({ success: true, scenario }, { status: 201 });
});
