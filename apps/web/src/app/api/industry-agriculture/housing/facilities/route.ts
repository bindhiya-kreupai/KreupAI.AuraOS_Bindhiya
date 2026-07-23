import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/route-wrapper';
import store from '../../store';

export const GET = createPublicRoute(async () => {
  const facilities = await store.getFacilities();
  return { facilities };
});

export const POST = createPublicRoute(async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  if (!body || !body.facilityName) {
    return NextResponse.json(
      {
        success: false,
        error: 'facilityName is required',
        errorAr: 'اسم المنشأة مطلوب',
      },
      { status: 400 }
    );
  }

  const facility = await store.createFacility(body);
  return { facility };
});
