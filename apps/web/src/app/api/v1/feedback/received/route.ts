import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      userId: 'emp-101',
      userName: 'Jane Smith',
      receivedFeedback: [
        {
          id: 'fb-010',
          fromUserName: 'Anonymous',
          type: 'upward',
          category: 'leadership',
          rating: 5,
          comment: 'Great mentor and leader. Provides clear direction and support.',
          isAnonymous: true,
          createdAt: '2026-01-19T14:00:00Z',
        },
        {
          id: 'fb-011',
          fromUserName: 'Tom Brown',
          type: 'peer',
          category: 'collaboration',
          rating: 4,
          comment: 'Always responsive and helpful during cross-team projects.',
          isAnonymous: false,
          createdAt: '2026-01-15T11:00:00Z',
        },
        {
          id: 'fb-012',
          fromUserName: 'Michael Lee',
          type: 'downward',
          category: 'communication',
          rating: 4,
          comment: 'Clear communication in team meetings and one-on-ones.',
          isAnonymous: false,
          createdAt: '2026-01-10T16:00:00Z',
        },
      ],
      averageRating: 4.3,
      totalCount: 3,
    },
  });
}
