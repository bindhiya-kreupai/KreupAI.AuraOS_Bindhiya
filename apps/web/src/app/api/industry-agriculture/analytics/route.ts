import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import store from '../store';

export const GET = createProtectedRoute(async () => {
  const analytics = await store.getAnalytics();
  return { analytics };
});
