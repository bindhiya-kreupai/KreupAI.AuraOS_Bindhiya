/**
 * Vendor detail API — Finance Module (AURA-150, AURA-158)
 * GET/PUT/DELETE a single vendor. Approve/reject flow through PUT with an
 * approvalStatus + status patch. tenantId/userId derived from session.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { VendorRepo } from '@/lib/services/finance/finance.service';

const notFound = () =>
  NextResponse.json(
    { success: false, message: 'Vendor not found.', messageAr: 'المورد غير موجود.' },
    { status: 404 }
  );

export const GET = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const vendor = await VendorRepo.get((auth as any).tenantId, params.id);
  if (!vendor) return notFound();
  return NextResponse.json({ success: true, vendor });
});

export const PUT = createProtectedRoute(async (request: NextRequest, { auth, params }) => {
  const body = await request.json().catch(() => ({}));
  // Stamp the approver from the session when approving, never from the client.
  if (body.approvalStatus === 'approved') {
    body.approvedBy = (auth as any).userId;
    body.approvedDate = new Date().toISOString();
  }
  const vendor = await VendorRepo.update(
    (auth as any).tenantId,
    (auth as any).userId,
    params.id,
    body
  );
  if (!vendor) return notFound();
  return NextResponse.json({ success: true, vendor });
});

export const DELETE = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const ok = await VendorRepo.remove((auth as any).tenantId, params.id);
  if (!ok) return notFound();
  return NextResponse.json({
    success: true,
    message: 'Vendor deleted.',
    messageAr: 'تم حذف المورد.',
  });
});
