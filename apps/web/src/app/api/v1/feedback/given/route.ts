import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (_request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('feedback:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing feedback:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  return NextResponse.json({
    success: true,
    data: {
      userId: 'emp-101',
      userName: 'Jane Smith',
      givenFeedback: [
        {
          id: 'fb-020',
          toUserName: 'Tom Brown',
          type: 'peer',
          category: 'collaboration',
          rating: 4,
          comment: 'Excellent teamwork on the Q4 project. Always willing to help.',
          isAnonymous: false,
          status: 'submitted',
          createdAt: '2026-01-18T10:00:00Z',
        },
        {
          id: 'fb-021',
          toUserName: 'David Lee',
          type: 'downward',
          category: 'technical_skills',
          rating: 4,
          comment: 'Strong technical growth this quarter. Keep pushing boundaries.',
          isAnonymous: false,
          status: 'submitted',
          createdAt: '2026-01-12T09:00:00Z',
        },
        {
          id: 'fb-022',
          toUserName: 'Sarah Connor',
          type: 'peer',
          category: 'initiative',
          rating: 5,
          comment: 'Outstanding initiative on the new CI/CD pipeline implementation.',
          isAnonymous: false,
          status: 'draft',
          createdAt: '2026-01-22T15:00:00Z',
        },
      ],
      totalCount: 3,
    },
  });
});
