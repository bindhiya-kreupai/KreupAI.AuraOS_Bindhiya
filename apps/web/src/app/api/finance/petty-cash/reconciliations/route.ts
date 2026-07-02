/**
 * Petty Cash Reconciliations API — Finance Module (AURA-158)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { PettyCashRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (_request: NextRequest, { auth }) => {
  const result = await PettyCashRepo.listReconciliations((auth as any).tenantId, {});
  return NextResponse.json({ success: true, reconciliations: result.items, ...result });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.fundId) {
    return NextResponse.json(
      { success: false, message: 'fundId is required.', messageAr: 'معرّف الصندوق مطلوب.' },
      { status: 400 }
    );
  }
  const reconciliation = await PettyCashRepo.createReconciliation(
    (auth as any).tenantId,
    (auth as any).userId,
    body
  );
  return NextResponse.json({ success: true, reconciliation }, { status: 201 });
});
