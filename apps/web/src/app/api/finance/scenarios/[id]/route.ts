/**
 * Budget Scenario detail API — Finance Module (AURA-153, AURA-158)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { ScenarioRepo } from '@/lib/services/finance/finance.service';

const notFound = () =>
  NextResponse.json(
    { success: false, message: 'Scenario not found.', messageAr: 'السيناريو غير موجود.' },
    { status: 404 }
  );

export const GET = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const scenario = await ScenarioRepo.get((auth as any).tenantId, params.id);
  if (!scenario) return notFound();
  return NextResponse.json({ success: true, scenario });
});

export const PUT = createProtectedRoute(async (request: NextRequest, { auth, params }) => {
  const body = await request.json().catch(() => ({}));
  const scenario = await ScenarioRepo.update(
    (auth as any).tenantId,
    (auth as any).userId,
    params.id,
    body
  );
  if (!scenario) return notFound();
  return NextResponse.json({ success: true, scenario });
});

export const DELETE = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const ok = await ScenarioRepo.remove((auth as any).tenantId, params.id);
  if (!ok) return notFound();
  return NextResponse.json({
    success: true,
    message: 'Scenario deleted.',
    messageAr: 'تم حذف السيناريو.',
  });
});
