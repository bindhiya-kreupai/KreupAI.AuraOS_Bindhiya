/**
 * Petty Cash Policies API — Finance Module (AURA-157, AURA-158)
 * Approval / category / spending-limit rules — DB-backed, tenant-scoped.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { PettyCashRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const { searchParams } = new URL(request.url);
  const policyType = searchParams.get('policyType') || undefined;
  const result = await PettyCashRepo.listPolicies((auth as any).tenantId, { policyType });
  return NextResponse.json({ success: true, policies: result.items, ...result });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.name) {
    return NextResponse.json(
      { success: false, message: 'name is required.', messageAr: 'الاسم مطلوب.' },
      { status: 400 }
    );
  }
  const policy = await PettyCashRepo.createPolicy(
    (auth as any).tenantId,
    (auth as any).userId,
    body
  );
  return NextResponse.json({ success: true, policy }, { status: 201 });
});
