import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

/** Tenant-wide gamification analytics computed from live tables. */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const period = new URL(request.url).searchParams.get('period') || 'monthly';
    const [accounts, awarded, redeemed, badgesAwarded, activeChallenges, missionsCompleted] =
      await Promise.all([
        (prisma as any).gamificationPointsAccount.count({ where: { tenantId: user.tenantId } }),
        (prisma as any).gamificationPointsTransaction.aggregate({
          where: { tenantId: user.tenantId, amount: { gt: 0 } },
          _sum: { amount: true },
        }),
        (prisma as any).gamificationPointsTransaction.aggregate({
          where: { tenantId: user.tenantId, amount: { lt: 0 } },
          _sum: { amount: true },
        }),
        (prisma as any).gamificationUserBadge.count({ where: { tenantId: user.tenantId } }),
        (prisma as any).gamificationChallenge.count({
          where: { tenantId: user.tenantId, status: 'active' },
        }),
        (prisma as any).gamificationUserMission.count({
          where: { tenantId: user.tenantId, status: 'completed' },
        }),
      ]);
    return successItem({
      period,
      totalActiveUsers: accounts,
      totalPointsAwarded: awarded._sum.amount || 0,
      totalPointsRedeemed: Math.abs(redeemed._sum.amount || 0),
      totalBadgesAwarded: badgesAwarded,
      activeChallenges,
      missionsCompleted,
    });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/analytics' }, 'Failed to get');
    return serverError(error, 'get');
  }
});
