import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

/**
 * Reward points balance for the current user.
 * Balance = sum(points from recognitions received) - sum(points already redeemed).
 * All queries are tenant + user scoped.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');

    const [earned, redeemed] = await Promise.all([
      prisma.recognition.aggregate({
        where: { tenantId: user.tenantId, receiverId: user.userId, isDeleted: false },
        _sum: { points: true },
      }),
      (prisma as any).engagementRewardRedemption.aggregate({
        where: { tenantId: user.tenantId, employeeId: user.userId, status: { not: 'REJECTED' } },
        _sum: { pointsCost: true },
      }),
    ]);

    const earnedPts = earned._sum.points || 0;
    const redeemedPts = redeemed._sum.pointsCost || 0;
    const balance = Math.max(0, earnedPts - redeemedPts);
    return successItem({ balance, earned: earnedPts, redeemed: redeemedPts });
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/rewards/balance' }, 'Failed');
    return serverError(error, 'get balance');
  }
});
