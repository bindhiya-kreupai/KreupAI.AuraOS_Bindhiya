import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import store from '../store';

// Simple permission check placeholder — replace with real wrapper when available
function checkPermission() {
  // TODO: integrate with createPublicRoute or withEnhancedAuth
  return true;
}

export async function GET(_req: NextRequest) {
  if (!checkPermission()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await store.seedIfEmpty();
  const workers = await store.getWorkers();
  return NextResponse.json({ success: true, workers });
}

export async function POST(req: NextRequest) {
  if (!checkPermission()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const worker = await store.createWorker(body);
  return NextResponse.json({ success: true, worker }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!checkPermission()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const id = body.workerId || body.id;
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  const updated = await store.updateWorker(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, worker: updated });
}

export async function DELETE(req: NextRequest) {
  if (!checkPermission()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const id = body.workerId || body.id;
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  const ok = await store.deleteWorker(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
