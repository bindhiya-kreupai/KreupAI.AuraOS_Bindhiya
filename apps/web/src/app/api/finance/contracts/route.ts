/**
 * Vendor Contract API — Finance Module (AURA-158, AURA-160)
 * DB-backed, tenant-scoped.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { ContractRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const vendorId = searchParams.get('vendorId') || undefined;
  const result = await ContractRepo.list((auth as any).tenantId, { status, vendorId });
  const now = Date.now();
  const soon = 1000 * 60 * 60 * 24 * 60;
  return NextResponse.json({
    success: true,
    contracts: result.items,
    ...result,
    summary: {
      activeContracts: result.items.filter((c: any) => c.status === 'active').length,
      totalContractValue: result.items.reduce(
        (s: number, c: any) => s + Number(c.totalContractValue || 0),
        0
      ),
      expiringContracts: result.items.filter(
        (c: any) =>
          c.endDate &&
          new Date(c.endDate).getTime() - now < soon &&
          new Date(c.endDate).getTime() > now
      ).length,
    },
  });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.contractName) {
    return NextResponse.json(
      { success: false, message: 'contractName is required.', messageAr: 'اسم العقد مطلوب.' },
      { status: 400 }
    );
  }
  const contract = await ContractRepo.create((auth as any).tenantId, (auth as any).userId, body);
  return NextResponse.json({ success: true, contract }, { status: 201 });
});
