import type { NextRequest } from 'next/server';
import { createPublicRoute } from '@/lib/api/route-wrapper';
import store from '../store';

export const GET = createPublicRoute(async () => {
  const analytics = await store.getAnalytics();
  return { analytics };
});
