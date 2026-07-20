/**
 * Petty Cash Transactions API — Finance Module (AURA-158)
 * DB-backed, tenant-scoped. Creating a disbursement/replenishment updates the
 * owning fund balance atomically in the service layer.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { PettyCashRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const { searchParams } = new URL(request.url);
  const fundId = searchParams.get('fundId') || undefined;
  const result = await PettyCashRepo.listTransactions((auth as any).tenantId, { fundId });
  return NextResponse.json({ success: true, transactions: result.items, ...result });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.fundId || body.amount == null) {
    return NextResponse.json(
      {
        success: false,
        message: 'fundId and amount are required.',
        messageAr: 'معرّف الصندوق والمبلغ مطلوبان.',
      },
      { status: 400 }
    );
  }
  const transaction = await PettyCashRepo.createTransaction(
    (auth as any).tenantId,
    (auth as any).userId,
    body
  );
  return NextResponse.json({ success: true, transaction }, { status: 201 });
});
