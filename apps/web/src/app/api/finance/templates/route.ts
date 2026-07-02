/**
 * Budget Template API — Finance Module (AURA-152, AURA-158)
 * DB-backed, tenant-scoped.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { TemplateRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const { searchParams } = new URL(request.url);
  const templateType = searchParams.get('templateType') || undefined;
  const result = await TemplateRepo.list((auth as any).tenantId, { templateType });
  return NextResponse.json({ success: true, templates: result.items, ...result });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.templateName) {
    return NextResponse.json(
      { success: false, message: 'templateName is required.', messageAr: 'اسم القالب مطلوب.' },
      { status: 400 }
    );
  }
  const template = await TemplateRepo.create((auth as any).tenantId, (auth as any).userId, body);
  return NextResponse.json({ success: true, template }, { status: 201 });
});
