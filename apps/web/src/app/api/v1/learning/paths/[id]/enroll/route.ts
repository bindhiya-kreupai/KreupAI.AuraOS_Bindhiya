import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, { _user, params }: any) => {
  params = params || {};
  const { id } = params;
  const body = await request.json();

  const enrollment = {
    id: 'enr-001',
    pathId: id,
    userId: body.userId || 'user-001',
    enrolledAt: new Date().toISOString(),
    status: 'active',
    expectedCompletion: '2026-04-15T00:00:00Z',
    currentModule: 1,
    progress: 0,
    schedule: {
      hoursPerWeek: body.hoursPerWeek || 5,
      preferredDays: body.preferredDays || ['monday', 'wednesday', 'friday'],
      reminderEnabled: true,
    },
  };

  return NextResponse.json(
    { success: true, data: enrollment, message: 'Successfully enrolled in learning path' },
    { status: 201 }
  );
});
