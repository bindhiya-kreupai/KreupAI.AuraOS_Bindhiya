import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import store from '../../../store';

export const GET = createProtectedRoute(async (_request: NextRequest, { params }) => {
  const cycle = await store.getCropCycleById(params.cycleId);
  if (!cycle) {
    return NextResponse.json(
      {
        success: false,
        error: 'Crop cycle not found',
        errorAr: 'دورة المحاصيل غير موجودة',
      },
      { status: 404 }
    );
  }
  return { cycle };
});

export const PUT = createProtectedRoute(async (request: NextRequest, { params }) => {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid payload',
        errorAr: 'حمولة غير صالحة',
      },
      { status: 400 }
    );
  }

  const cycle = await store.updateCropCycle(params.cycleId, body);
  if (!cycle) {
    return NextResponse.json(
      {
        success: false,
        error: 'Crop cycle not found',
        errorAr: 'دورة المحاصيل غير موجودة',
      },
      { status: 404 }
    );
  }
  return { cycle };
});

export const DELETE = createProtectedRoute(async (_request: NextRequest, { params }) => {
  const deleted = await store.deleteCropCycle(params.cycleId);
  if (!deleted) {
    return NextResponse.json(
      {
        success: false,
        error: 'Crop cycle not found',
        errorAr: 'دورة المحاصيل غير موجودة',
      },
      { status: 404 }
    );
  }
  return { success: true };
});
