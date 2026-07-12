import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import store from '../store';

export const GET = createProtectedRoute(async () => {
  const settings = await store.getSettings();
  return { settings };
});

export const PUT = createProtectedRoute(async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid payload',
        errorAr: 'حمولة غير صالحة',
      },
      { status: 400 }
    );
  }

  const settings = await store.updateSettings(body);
  return { settings };
});
