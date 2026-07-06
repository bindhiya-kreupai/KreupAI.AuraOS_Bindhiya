/**
 * Petty Cash Funds API — Finance Module (AURA-157, AURA-158)
 * DB-backed, tenant-scoped.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { PettyCashRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (_request: NextRequest, { auth }) => {
  const result = await PettyCashRepo.listFunds((auth as any).tenantId, {});
  return NextResponse.json({
    success: true,
    funds: result.items,
    ...result,
    summary: {
      activeFunds: result.items.filter((f: any) => f.status === 'active').length,
      totalBalance: result.items.reduce(
        (s: number, f: any) => s + Number(f.currentBalance || 0),
        0
      ),
      pendingReconciliations: 0,
    },
  });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.fundName) {
    return NextResponse.json(
      { success: false, message: 'fundName is required.', messageAr: 'اسم الصندوق مطلوب.' },
      { status: 400 }
    );
  }
  const fund = await PettyCashRepo.createFund((auth as any).tenantId, (auth as any).userId, body);
  return NextResponse.json({ success: true, fund }, { status: 201 });
});

export const PUT = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Fund ID is required.', messageAr: 'معرّف الصندوق مطلوب.' },
      { status: 400 }
    );
  }
  const body = await request.json().catch(() => ({}));
  const fund = await PettyCashRepo.updateFund(
    (auth as any).tenantId,
    (auth as any).userId,
    id,
    body
  );
  if (!fund) {
    return NextResponse.json(
      { success: false, message: 'Fund not found.', messageAr: 'الصندوق غير موجود.' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, fund });
});
