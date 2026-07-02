/**
 * Budget Scenario run API — Finance Module (AURA-153, AURA-158)
 * Applies scenario assumptions to compute adjusted totals and variance.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { ScenarioRepo } from '@/lib/services/finance/finance.service';

export const POST = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const scenario = await ScenarioRepo.run((auth as any).tenantId, params.id);
  if (!scenario) {
    return NextResponse.json(
      { success: false, message: 'Scenario not found.', messageAr: 'السيناريو غير موجود.' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, scenario });
});
