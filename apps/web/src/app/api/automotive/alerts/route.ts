import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async () => {
  return NextResponse.json({ alerts: [] });
});

export const POST = createProtectedRoute(async (request: Request) => {
  const body = await request.json();
  return NextResponse.json(
    {
      alert: {
        ...body,
        alertId: body.alertId || `alt-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 }
  );
});
