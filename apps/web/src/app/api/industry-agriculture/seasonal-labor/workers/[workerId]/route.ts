import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import store from '../../../store';

export const GET = createProtectedRoute(async (_request: NextRequest, { params }) => {
  const worker = await store.getWorkerById(params.workerId);
  if (!worker) {
    return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
  }
  return { worker };
});

export const PUT = createProtectedRoute(async (request: NextRequest, { params }) => {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }

  const updated = await store.updateWorker(params.workerId, body);
  if (!updated) {
    return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
  }

  return { worker: updated };
});

export const DELETE = createProtectedRoute(async (request: NextRequest, { params }) => {
  const deleted = await store.deleteWorker(params.workerId);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
  }
  return { success: true };
});
