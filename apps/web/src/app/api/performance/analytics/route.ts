import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const stats = {
      totalReviews: 150,
      completedReviews: 120,
      averageRating: 4.2,
      ratingDistribution: {
        1: 5,
        2: 10,
        3: 30,
        4: 50,
        5: 25,
      },
      goalAchievementRate: 85,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
