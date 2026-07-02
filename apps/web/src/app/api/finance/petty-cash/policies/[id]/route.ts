/**
 * Petty Cash Policy detail API — Finance Module (AURA-157, AURA-158)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { PettyCashRepo } from '@/lib/services/finance/finance.service';

const notFound = () =>
  NextResponse.json(
    { success: false, message: 'Policy not found.', messageAr: 'السياسة غير موجودة.' },
    { status: 404 }
  );

export const PUT = createProtectedRoute(async (request: NextRequest, { auth, params }) => {
  const body = await request.json().catch(() => ({}));
  const policy = await PettyCashRepo.updatePolicy(
    (auth as any).tenantId,
    (auth as any).userId,
    params.id,
    body
  );
  if (!policy) return notFound();
  return NextResponse.json({ success: true, policy });
});

export const DELETE = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const ok = await PettyCashRepo.removePolicy((auth as any).tenantId, params.id);
  if (!ok) return notFound();
  return NextResponse.json({
    success: true,
    message: 'Policy deleted.',
    messageAr: 'تم حذف السياسة.',
  });
});
