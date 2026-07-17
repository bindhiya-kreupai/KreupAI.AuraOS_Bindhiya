import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/route-wrapper';
import store from '../store';

export const GET = createPublicRoute(async () => {
  const cycles = await store.getCropCycles();
  return { cycles };
});

export const POST = createPublicRoute(async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  if (!body || !body.cropName) {
    return NextResponse.json(
      {
        success: false,
        error: 'cropName is required',
        errorAr: 'اسم المحصول مطلوب',
      },
      { status: 400 }
    );
  }

  const cycle = await store.createCropCycle(body);
  return { cycle };
});
