import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, { _user }: any) => {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    data: {
      id: 'cal-001',
      title: body.title || 'Q4 2025 Performance Calibration',
      department: body.department || 'Engineering',
      facilitatorId: body.facilitatorId || 'emp-200',
      facilitatorName: 'HR Director',
      participants: body.participants || ['emp-201', 'emp-202', 'emp-203'],
      reviewPeriod: body.reviewPeriod || '2025-Q4',
      employeesUnderReview: body.employeeIds || [
        'emp-101',
        'emp-102',
        'emp-103',
        'emp-104',
        'emp-105',
      ],
      ratingDistribution: {
        exceptional: 0,
        exceedsExpectations: 0,
        meetsExpectations: 0,
        needsImprovement: 0,
        unsatisfactory: 0,
      },
      status: 'scheduled',
      scheduledDate: body.scheduledDate || '2026-02-01T10:00:00Z',
      createdAt: new Date().toISOString(),
    },
  });
});
