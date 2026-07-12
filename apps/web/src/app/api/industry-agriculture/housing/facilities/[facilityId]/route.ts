import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import store from '../../../store';

export const GET = createProtectedRoute(async (_request: NextRequest, { params }) => {
  const facility = await store.getFacilityById(params.facilityId);
  if (!facility) {
    return NextResponse.json(
      {
        success: false,
        error: 'Facility not found',
        errorAr: 'المنشأة غير موجودة',
      },
      { status: 404 }
    );
  }
  return { facility };
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

  const facility = await store.updateFacility(params.facilityId, body);
  if (!facility) {
    return NextResponse.json(
      {
        success: false,
        error: 'Facility not found',
        errorAr: 'المنشأة غير موجودة',
      },
      { status: 404 }
    );
  }

  return { facility };
});

export const DELETE = createProtectedRoute(async (_request: NextRequest, { params }) => {
  const deleted = await store.deleteFacility(params.facilityId);
  if (!deleted) {
    return NextResponse.json(
      {
        success: false,
        error: 'Facility not found',
        errorAr: 'المنشأة غير موجودة',
      },
      { status: 404 }
    );
  }
  return { success: true };
});
