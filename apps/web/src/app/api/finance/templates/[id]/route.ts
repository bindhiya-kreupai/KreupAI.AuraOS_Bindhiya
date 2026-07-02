/**
 * Budget Template detail API — Finance Module (AURA-152, AURA-158)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { TemplateRepo } from '@/lib/services/finance/finance.service';

const notFound = () =>
  NextResponse.json(
    { success: false, message: 'Template not found.', messageAr: 'القالب غير موجود.' },
    { status: 404 }
  );

export const GET = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const template = await TemplateRepo.get((auth as any).tenantId, params.id);
  if (!template) return notFound();
  return NextResponse.json({ success: true, template });
});

export const PUT = createProtectedRoute(async (request: NextRequest, { auth, params }) => {
  const body = await request.json().catch(() => ({}));
  const template = await TemplateRepo.update(
    (auth as any).tenantId,
    (auth as any).userId,
    params.id,
    body
  );
  if (!template) return notFound();
  return NextResponse.json({ success: true, template });
});

export const DELETE = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const ok = await TemplateRepo.remove((auth as any).tenantId, params.id);
  if (!ok) return notFound();
  return NextResponse.json({
    success: true,
    message: 'Template deleted.',
    messageAr: 'تم حذف القالب.',
  });
});
