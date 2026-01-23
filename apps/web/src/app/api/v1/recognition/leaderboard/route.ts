import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      period: 'monthly',
      month: '2026-01',
      leaderboard: [
        {
          rank: 1,
          userId: 'emp-104',
          userName: 'Michael Lee',
          avatar: '/avatars/michael.jpg',
          department: 'Engineering',
          totalPoints: 450,
          recognitionsReceived: 8,
          badgesEarned: ['innovator', 'team_player', 'mentor'],
        },
        {
          rank: 2,
          userId: 'emp-101',
          userName: 'Jane Smith',
          avatar: '/avatars/jane.jpg',
          department: 'Engineering',
          totalPoints: 375,
          recognitionsReceived: 6,
          badgesEarned: ['mentor', 'leader'],
        },
        {
          rank: 3,
          userId: 'emp-102',
          userName: 'Tom Brown',
          avatar: '/avatars/tom.jpg',
          department: 'Product',
          totalPoints: 300,
          recognitionsReceived: 5,
          badgesEarned: ['team_player', 'problem_solver'],
        },
        {
          rank: 4,
          userId: 'emp-103',
          userName: 'Sarah Connor',
          avatar: '/avatars/sarah.jpg',
          department: 'DevOps',
          totalPoints: 250,
          recognitionsReceived: 4,
          badgesEarned: ['innovator'],
        },
        {
          rank: 5,
          userId: 'emp-105',
          userName: 'David Lee',
          avatar: '/avatars/david.jpg',
          department: 'Engineering',
          totalPoints: 200,
          recognitionsReceived: 3,
          badgesEarned: ['fast_learner'],
        },
      ],
      totalParticipants: 45,
    },
  });
}
