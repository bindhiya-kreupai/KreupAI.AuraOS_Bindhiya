import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import store from '../../../store';

export const POST = createProtectedRoute(async (request: NextRequest, { params }) => {
  const body = await request.json().catch(() => null);
  if (!body || body.stage == null) {
    return NextResponse.json(
      {
        success: false,
        error: 'stage is required',
        errorAr: 'المرحلة مطلوبة',
      },
      { status: 400 }
    );
  }

  const updatedCycle = await store.updateCropStage(params.cycleId, body.stage);
  if (!updatedCycle) {
    return NextResponse.json(
      {
        success: false,
        error: 'Crop cycle not found',
        errorAr: 'دورة المحاصيل غير موجودة',
      },
      { status: 404 }
    );
  }

  return { cycle: updatedCycle };
});
