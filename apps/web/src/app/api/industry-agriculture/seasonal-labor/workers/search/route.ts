import type { NextRequest } from 'next/server';
import { createPublicRoute } from '@/lib/api/route-wrapper';
import store from '../../../store';

export const GET = createPublicRoute(async (request: NextRequest) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') || undefined;
  const status = url.searchParams.get('status') || undefined;
  const seasonType = url.searchParams.get('seasonType') || undefined;
  const skills = url.searchParams.get('skills')
    ? url.searchParams
        .get('skills')!
        .split(',')
        .map((skill) => skill.trim())
    : undefined;

  const workers = await store.searchWorkers({ query, status, seasonType, skills });
  return { workers };
});
