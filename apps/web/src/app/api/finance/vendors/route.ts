/**
 * Vendors API — Finance Module (AURA-149, AURA-158)
 * DB-backed, tenant-scoped. tenantId/userId derived from the session; any
 * client-sent id is ignored.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { VendorRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 100;

  const result = await VendorRepo.list((auth as any).tenantId, { status, search, page, pageSize });
  const active = result.items.filter((v: any) => v.status === 'active').length;
  const pending = result.items.filter((v: any) => v.approvalStatus === 'pending').length;
  return NextResponse.json({
    success: true,
    vendors: result.items,
    ...result,
    summary: {
      totalVendors: result.total,
      activeVendors: active,
      pendingApproval: pending,
      totalSpend: result.items.reduce((s: number, v: any) => s + Number(v.totalSpend || 0), 0),
    },
  });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => null);
  if (!body || !body.vendorName) {
    return NextResponse.json(
      { success: false, message: 'vendorName is required.', messageAr: 'اسم المورد مطلوب.' },
      { status: 400 }
    );
  }
  const vendor = await VendorRepo.create((auth as any).tenantId, (auth as any).userId, body);
  return NextResponse.json({ success: true, vendor }, { status: 201 });
});
