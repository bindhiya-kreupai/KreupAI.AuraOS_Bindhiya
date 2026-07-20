/**
 * Financial Asset depreciation API — Finance Module (AURA-158)
 * Computes and persists one period of depreciation for the asset.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { AssetRepo } from '@/lib/services/finance/finance.service';

export const POST = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const depreciation = await AssetRepo.calculateDepreciation((auth as any).tenantId, params.id);
  if (depreciation === null) {
    return NextResponse.json(
      { success: false, message: 'Asset not found.', messageAr: 'الأصل غير موجود.' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, depreciation });
});
