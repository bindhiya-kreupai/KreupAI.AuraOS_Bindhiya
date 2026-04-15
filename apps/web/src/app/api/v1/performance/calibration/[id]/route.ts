import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  const { id } = await context.params;

  return NextResponse.json({
    success: true,
    data: {
      id,
      title: 'Q4 2025 Performance Calibration',
      department: 'Engineering',
      facilitatorName: 'HR Director',
      participants: [
        { id: 'emp-201', name: 'VP Engineering', role: 'reviewer' },
        { id: 'emp-202', name: 'Engineering Manager', role: 'reviewer' },
        { id: 'emp-203', name: 'Tech Lead', role: 'reviewer' },
      ],
      reviewPeriod: '2025-Q4',
      employees: [
        {
          id: 'emp-101',
          name: 'Jane Smith',
          initialRating: 'exceedsExpectations',
          calibratedRating: 'exceedsExpectations',
          notes: 'Consistent high performer, led major project successfully',
        },
        {
          id: 'emp-102',
          name: 'Tom Brown',
          initialRating: 'exceptional',
          calibratedRating: 'exceedsExpectations',
          notes: 'Strong performer, adjusted for consistency across teams',
        },
        {
          id: 'emp-103',
          name: 'Sarah Connor',
          initialRating: 'meetsExpectations',
          calibratedRating: 'meetsExpectations',
          notes: 'Solid contributor, on track for growth',
        },
        {
          id: 'emp-104',
          name: 'Michael Lee',
          initialRating: 'exceedsExpectations',
          calibratedRating: 'exceptional',
          notes: 'Outstanding innovation contributions, upgraded after calibration',
        },
        {
          id: 'emp-105',
          name: 'David Lee',
          initialRating: 'meetsExpectations',
          calibratedRating: 'meetsExpectations',
          notes: 'Good first-year performance, building skills',
        },
      ],
      ratingDistribution: {
        exceptional: 1,
        exceedsExpectations: 2,
        meetsExpectations: 2,
        needsImprovement: 0,
        unsatisfactory: 0,
      },
      status: 'completed',
      scheduledDate: '2026-02-01T10:00:00Z',
      completedAt: '2026-02-01T12:30:00Z',
    },
  });
});
