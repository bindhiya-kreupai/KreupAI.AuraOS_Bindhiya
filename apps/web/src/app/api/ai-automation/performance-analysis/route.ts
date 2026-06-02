import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

// Aggregate performance ratings across reviews + goal progress.
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:read')) return forbidden('ai-automation:read');
    const [reviews, goals] = await Promise.all([
      prisma.performanceReview.findMany({
        where: { tenantId: user.tenantId } as any,
        select: { finalRating: true } as any,
      }),
      prisma.performanceGoal.findMany({
        where: { tenantId: user.tenantId },
        select: { progress: true } as any,
      }),
    ]);
    const ratings = reviews.map((r: any) => Number(r.finalRating || 0)).filter((n) => n > 0);
    const goalProgress = goals.map((g: any) => Number(g.progress || 0));
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const avgGoalProgress = goalProgress.length
      ? goalProgress.reduce((a, b) => a + b, 0) / goalProgress.length
      : 0;
    const output = {
      reviewsCounted: ratings.length,
      averageRating: avgRating,
      goalsCounted: goalProgress.length,
      averageGoalProgress: avgGoalProgress,
      generatedAt: new Date().toISOString(),
    };
    await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'performance_analysis',
        output: output as any,
        completedAt: new Date(),
        durationMs: 0,
      },
    });
    return successItem(output);
  } catch (error: any) {
    return serverError(error, 'analyze performance');
  }
});
