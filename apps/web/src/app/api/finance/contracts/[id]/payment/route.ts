/**
 * Vendor Contract payment API — Finance Module (AURA-158)
 * Marks a payment-schedule milestone paid and recomputes spend/utilization.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { ContractRepo } from '@/lib/services/finance/finance.service';

export const POST = createProtectedRoute(async (request: NextRequest, { auth, params }) => {
  const body = await request.json().catch(() => ({}));
  const { scheduleId, invoiceNumber } = body;
  if (!scheduleId || !invoiceNumber) {
    return NextResponse.json(
      {
        success: false,
        message: 'scheduleId and invoiceNumber are required.',
        messageAr: 'معرّف الجدول ورقم الفاتورة مطلوبان.',
      },
      { status: 400 }
    );
  }
  const contract = await ContractRepo.recordPayment(
    (auth as any).tenantId,
    params.id,
    scheduleId,
    invoiceNumber
  );
  if (!contract) {
    return NextResponse.json(
      { success: false, message: 'Contract not found.', messageAr: 'العقد غير موجود.' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, contract });
});
