/**
 * Financial Asset API — Finance Module (AURA-154, AURA-158)
 * DB-backed, tenant-scoped finance asset register (capital / operational).
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { AssetRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const { searchParams } = new URL(request.url);
  const assetType = searchParams.get('assetType') || undefined;
  const result = await AssetRepo.list((auth as any).tenantId, { assetType });
  return NextResponse.json({
    success: true,
    assets: result.items,
    ...result,
    summary: {
      totalAssets: result.total,
      totalValue: result.items.reduce((s: number, a: any) => s + Number(a.currentValue || 0), 0),
      totalDepreciation: result.items.reduce(
        (s: number, a: any) => s + Number(a.accumulatedDepreciation || 0),
        0
      ),
      assetsUnderMaintenance: result.items.filter((a: any) => a.status === 'under_repair').length,
    },
  });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => ({}));
  if (!body.assetName) {
    return NextResponse.json(
      { success: false, message: 'assetName is required.', messageAr: 'اسم الأصل مطلوب.' },
      { status: 400 }
    );
  }
  const asset = await AssetRepo.create((auth as any).tenantId, (auth as any).userId, body);
  return NextResponse.json({ success: true, asset }, { status: 201 });
});
