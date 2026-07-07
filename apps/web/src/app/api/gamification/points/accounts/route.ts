import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';
import { tierForPoints, pointsToNextLevel } from '@/lib/gamification/points';

/** List all points accounts for the tenant (leaderboard / admin views). */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const rows = await (prisma as any).gamificationPointsAccount.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { totalPoints: 'desc' },
    });
    const data = rows.map((r: any) => {
      const tier = tierForPoints(r.totalPoints);
      return {
        accountId: r.id,
        userId: r.employeeId,
        totalPoints: r.totalPoints,
        lifetimePoints: r.lifetimePoints,
        currentBalance: r.currentBalance,
        currentLevel: tier.level,
        currentTier: tier.tier,
        pointsToNextLevel: pointsToNextLevel(r.totalPoints),
        currentStreak: r.currentStreak,
        longestStreak: r.longestStreak,
      };
    });
    return successList(data, 1, data.length || 1, data.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/points/accounts' }, 'Failed to list');
    return serverError(error, 'list');
  }
});
