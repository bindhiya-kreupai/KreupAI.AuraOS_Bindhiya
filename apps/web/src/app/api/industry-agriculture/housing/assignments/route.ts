import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import store from '../../store';

export const GET = createProtectedRoute(async () => {
  const assignments = await store.getAssignments();
  return { assignments };
});

export const POST = createProtectedRoute(async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  if (!body || !body.workerId) {
    return NextResponse.json(
      {
        success: false,
        error: 'workerId is required',
        errorAr: 'معرّف العامل مطلوب',
      },
      { status: 400 }
    );
  }

  const assignment = await store.createAssignment(body);
  return { assignment };
});
