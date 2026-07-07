/**
 * Vendor Contract detail API — Finance Module (AURA-158)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { ContractRepo } from '@/lib/services/finance/finance.service';

const notFound = () =>
  NextResponse.json(
    { success: false, message: 'Contract not found.', messageAr: 'العقد غير موجود.' },
    { status: 404 }
  );

export const GET = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const contract = await ContractRepo.get((auth as any).tenantId, params.id);
  if (!contract) return notFound();
  return NextResponse.json({ success: true, contract });
});

export const PUT = createProtectedRoute(async (request: NextRequest, { auth, params }) => {
  const body = await request.json().catch(() => ({}));
  const contract = await ContractRepo.update(
    (auth as any).tenantId,
    (auth as any).userId,
    params.id,
    body
  );
  if (!contract) return notFound();
  return NextResponse.json({ success: true, contract });
});

export const DELETE = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const ok = await ContractRepo.remove((auth as any).tenantId, params.id);
  if (!ok) return notFound();
  return NextResponse.json({
    success: true,
    message: 'Contract deleted.',
    messageAr: 'تم حذف العقد.',
  });
});
