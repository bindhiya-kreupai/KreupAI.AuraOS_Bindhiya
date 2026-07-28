import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/route-wrapper';
import store from '../../store';

const debugHeaders = {
  'x-route-hit': 'industry-agriculture/seasonal-labor/workers',
};

export const GET = createPublicRoute(async () => {
  try {
    const workers = await store.getWorkers();
    return NextResponse.json({ routeHit: true, workers }, { headers: debugHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { routeHit: true, error: error?.message ?? 'unknown_error' },
      { status: 500, headers: debugHeaders }
    );
  }
});

export const POST = createPublicRoute(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.fullName) {
      return NextResponse.json(
        { routeHit: true, success: false, error: 'fullName is required' },
        { status: 400, headers: debugHeaders }
      );
    }

    const worker = await store.createWorker({
      ...body,
      status: body.status || 'active',
    });

    return NextResponse.json({ routeHit: true, worker }, { status: 201, headers: debugHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { routeHit: true, error: error?.message ?? 'unknown_error' },
      { status: 500, headers: debugHeaders }
    );
  }
});
