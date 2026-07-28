import type { NextRequest } from 'next/server';
import { createPublicRoute } from '@/lib/api/route-wrapper';
import store from '../../store';

export const GET = createPublicRoute(async () => {
  const inspections = await store.getInspections();
  return { inspections };
});

export const POST = createPublicRoute(async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  if (!body || !body.facilityId || !body.inspectorName) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'facilityId and inspectorName are required',
        errorAr: 'معرّف المنشأة واسم المفتش مطلوبان',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  const inspection = await store.createInspection(body);
  return { inspection };
});
