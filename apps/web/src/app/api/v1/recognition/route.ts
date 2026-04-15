import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (_request: NextRequest, { _user }: any) => {
  return NextResponse.json({
    success: true,
    data: {
      feed: [
        {
          id: 'rec-001',
          fromUserId: 'emp-101',
          fromUserName: 'Jane Smith',
          fromUserAvatar: '/avatars/jane.jpg',
          toUserId: 'emp-102',
          toUserName: 'Tom Brown',
          toUserAvatar: '/avatars/tom.jpg',
          badge: 'team_player',
          badgeLabel: 'Team Player',
          points: 50,
          message: 'Thank you for going above and beyond to help the team meet the deadline!',
          likes: 12,
          comments: 3,
          createdAt: '2026-01-22T09:00:00Z',
        },
        {
          id: 'rec-002',
          fromUserId: 'emp-103',
          fromUserName: 'Sarah Connor',
          fromUserAvatar: '/avatars/sarah.jpg',
          toUserId: 'emp-104',
          toUserName: 'Michael Lee',
          toUserAvatar: '/avatars/michael.jpg',
          badge: 'innovator',
          badgeLabel: 'Innovator',
          points: 75,
          message: 'Brilliant solution to the performance bottleneck. Truly innovative thinking!',
          likes: 20,
          comments: 5,
          createdAt: '2026-01-21T16:00:00Z',
        },
        {
          id: 'rec-003',
          fromUserId: 'emp-105',
          fromUserName: 'David Lee',
          fromUserAvatar: '/avatars/david.jpg',
          toUserId: 'emp-101',
          toUserName: 'Jane Smith',
          toUserAvatar: '/avatars/jane.jpg',
          badge: 'mentor',
          badgeLabel: 'Mentor',
          points: 100,
          message:
            'Incredible mentorship throughout the onboarding process. Made all the difference!',
          likes: 15,
          comments: 4,
          createdAt: '2026-01-20T11:00:00Z',
        },
      ],
      total: 3,
    },
  });
});

export const POST = withEnhancedAuth(async (request: NextRequest, { _user }: any) => {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    data: {
      id: 'rec-004',
      fromUserId: body.fromUserId || 'emp-101',
      toUserId: body.toUserId,
      toUserName: body.toUserName,
      badge: body.badge || 'kudos',
      badgeLabel: body.badgeLabel || 'Kudos',
      points: body.points || 25,
      message: body.message,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    },
  });
});
