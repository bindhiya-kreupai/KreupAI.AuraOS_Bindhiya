import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
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
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  return NextResponse.json({
    success: true,
    data: {
      feedback: [
        {
          id: 'fb-001',
          fromUserId: 'emp-101',
          fromUserName: 'Jane Smith',
          toUserId: 'emp-102',
          toUserName: 'Tom Brown',
          type: type || 'peer',
          category: 'collaboration',
          rating: 4,
          comment: 'Excellent teamwork on the Q4 project. Always willing to help.',
          status: status || 'submitted',
          isAnonymous: false,
          createdAt: '2026-01-18T10:00:00Z',
        },
        {
          id: 'fb-002',
          fromUserId: 'emp-103',
          fromUserName: 'Anonymous',
          toUserId: 'emp-101',
          toUserName: 'Jane Smith',
          type: type || 'upward',
          category: 'leadership',
          rating: 5,
          comment: 'Great mentor and leader. Provides clear direction and support.',
          status: status || 'submitted',
          isAnonymous: true,
          createdAt: '2026-01-19T14:00:00Z',
        },
        {
          id: 'fb-003',
          fromUserId: 'emp-104',
          fromUserName: 'Sarah Connor',
          toUserId: 'emp-105',
          toUserName: 'David Lee',
          type: type || 'peer',
          category: 'technical_skills',
          rating: 3,
          comment: 'Good technical foundation but could improve code review practices.',
          status: status || 'draft',
          isAnonymous: false,
          createdAt: '2026-01-20T09:00:00Z',
        },
      ],
      total: 3,
      filters: { type, status },
    },
  });
});

export const POST = withEnhancedAuth(async (request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('feedback:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing feedback:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const body = await request.json();

  return NextResponse.json({
    success: true,
    data: {
      id: 'fb-004',
      fromUserId: body.fromUserId || 'emp-101',
      toUserId: body.toUserId,
      type: body.type || 'peer',
      category: body.category || 'general',
      rating: body.rating,
      comment: body.comment,
      isAnonymous: body.isAnonymous || false,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    },
  });
});
