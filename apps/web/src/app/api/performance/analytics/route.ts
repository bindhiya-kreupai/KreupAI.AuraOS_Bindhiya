import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;

    // Count reviews by status
    const [totalReviews, completedReviews, reviewRatings, totalGoals, completedGoals] = await Promise.all([
      prisma.performanceReview.count({ where: { tenantId } }),
      prisma.performanceReview.count({ where: { tenantId, status: 'completed' } }),
      prisma.performanceReview.aggregate({
        where: { tenantId, finalRating: { not: null } },
        _avg: { finalRating: true },
      }),
      prisma.performanceGoal.count({ where: { tenantId } }),
      prisma.performanceGoal.count({ where: { tenantId, status: 'completed' } }),
    ]);

    // Get rating distribution
    const reviews = await prisma.performanceReview.findMany({
      where: { tenantId, finalRating: { not: null } },
      select: { finalRating: true },
    });

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (r.finalRating !== null) {
        const rounded = Math.round(r.finalRating);
        const key = Math.min(Math.max(rounded, 1), 5);
        ratingDistribution[key] = (ratingDistribution[key] || 0) + 1;
      }
    });

    const goalAchievementRate = totalGoals > 0
      ? Math.round((completedGoals / totalGoals) * 100)
      : 0;

    const stats = {
      totalReviews,
      completedReviews,
      averageRating: reviewRatings._avg.finalRating
        ? Math.round(reviewRatings._avg.finalRating * 10) / 10
        : 0,
      ratingDistribution,
      goalAchievementRate,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
