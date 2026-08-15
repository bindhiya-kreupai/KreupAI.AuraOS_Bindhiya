import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createPublicRoute } from '@/lib/api/route-wrapper';
import store from '../../../../store';

export const POST = createPublicRoute(async (request: NextRequest, { params }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { success: false, error: 'Invalid assignment payload' },
      { status: 400 }
    );
  }

  const worker = await store.assignWorker(params.workerId, body);
  if (!worker) {
    return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
  }

  return { worker };
});
