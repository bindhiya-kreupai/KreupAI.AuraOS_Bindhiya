/**
 * Financial Asset detail API — Finance Module (AURA-154, AURA-158)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { AssetRepo } from '@/lib/services/finance/finance.service';

const notFound = () =>
  NextResponse.json(
    { success: false, message: 'Asset not found.', messageAr: 'الأصل غير موجود.' },
    { status: 404 }
  );

export const GET = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const asset = await AssetRepo.get((auth as any).tenantId, params.id);
  if (!asset) return notFound();
  return NextResponse.json({ success: true, asset });
});

export const PUT = createProtectedRoute(async (request: NextRequest, { auth, params }) => {
  const body = await request.json().catch(() => ({}));
  const asset = await AssetRepo.update(
    (auth as any).tenantId,
    (auth as any).userId,
    params.id,
    body
  );
  if (!asset) return notFound();
  return NextResponse.json({ success: true, asset });
});

export const DELETE = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const ok = await AssetRepo.remove((auth as any).tenantId, params.id);
  if (!ok) return notFound();
  return NextResponse.json({
    success: true,
    message: 'Asset deleted.',
    messageAr: 'تم حذف الأصل.',
  });
});
