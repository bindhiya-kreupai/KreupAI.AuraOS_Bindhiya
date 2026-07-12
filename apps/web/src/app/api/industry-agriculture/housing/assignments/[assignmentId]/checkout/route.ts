import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import store from '../../../../store';

export const POST = createProtectedRoute(async (request: NextRequest, { params }) => {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid payload',
        errorAr: 'حمولة غير صالحة',
      },
      { status: 400 }
    );
  }

  const assignment = await store.checkOutAssignment(params.assignmentId, body);
  if (!assignment) {
    return NextResponse.json(
      {
        success: false,
        error: 'Assignment not found',
        errorAr: 'التكليف غير موجود',
      },
      { status: 404 }
    );
  }

  return { assignment };
});
