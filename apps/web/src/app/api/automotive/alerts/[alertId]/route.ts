import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const PUT = createProtectedRoute(async (request: Request, { params }: any) => {
  const body = await request.json();
  return NextResponse.json({
    alert: {
      ...body,
      alertId: params.alertId,
    },
  });
});
