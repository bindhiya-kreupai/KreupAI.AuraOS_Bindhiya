import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import store from '../../store';

export const GET = createProtectedRoute(async () => {
  const schedules = await store.getHarvestSchedules();
  return { schedules };
});

export const POST = createProtectedRoute(async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  if (!body || !body.cropName || !body.startDate) {
    return NextResponse.json(
      {
        success: false,
        error: 'cropName and startDate are required',
        errorAr: 'اسم المحصول وتاريخ البدء مطلوبان',
      },
      { status: 400 }
    );
  }

  const schedule = await store.createHarvestSchedule(body);
  return { schedule };
});
