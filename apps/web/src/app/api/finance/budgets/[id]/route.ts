/**
 * Budget detail API — Finance Module (AURA-151, AURA-158)
 * GET/PUT/DELETE. Approve/reject flow through PUT with approvalStatus + status.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { BudgetRepo } from '@/lib/services/finance/finance.service';

const notFound = () =>
  NextResponse.json(
    { success: false, message: 'Budget not found.', messageAr: 'الميزانية غير موجودة.' },
    { status: 404 }
  );

export const GET = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const budget = await BudgetRepo.get((auth as any).tenantId, params.id);
  if (!budget) return notFound();
  return NextResponse.json({ success: true, budget });
});

export const PUT = createProtectedRoute(async (request: NextRequest, { auth, params }) => {
  const body = await request.json().catch(() => ({}));
  // Stamp the approver from the session when approving, never from the client.
  if (body.approvalStatus === 'approved') {
    body.approvedBy = (auth as any).userId;
    body.approvedByName = (auth as any).email;
    body.approvedDate = new Date().toISOString();
  }
  const budget = await BudgetRepo.update(
    (auth as any).tenantId,
    (auth as any).userId,
    params.id,
    body
  );
  if (!budget) return notFound();
  return NextResponse.json({ success: true, budget });
});

export const DELETE = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const ok = await BudgetRepo.remove((auth as any).tenantId, params.id);
  if (!ok) return notFound();
  return NextResponse.json({
    success: true,
    message: 'Budget deleted.',
    messageAr: 'تم حذف الميزانية.',
  });
});
