/**
 * Petty Cash Transaction approval API — Finance Module (AURA-158)
 * Approver is derived from the session, never from the client body.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { PettyCashRepo } from '@/lib/services/finance/finance.service';

export const PUT = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const transaction = await PettyCashRepo.approveTransaction(
    (auth as any).tenantId,
    (auth as any).userId,
    params.id
  );
  if (!transaction) {
    return NextResponse.json(
      { success: false, message: 'Transaction not found.', messageAr: 'المعاملة غير موجودة.' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, transaction });
});
