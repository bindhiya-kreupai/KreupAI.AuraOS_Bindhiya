import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import store from '../../store';

export const GET = createProtectedRoute(async () => {
  const pools = await store.getLaborPools();
  return { pools };
});

export const POST = createProtectedRoute(async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  if (!body || !body.seasonName) {
    return NextResponse.json({ success: false, error: 'seasonName is required' }, { status: 400 });
  }

  const pool = await store.createLaborPool(body);
  return { pool };
});
