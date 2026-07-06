import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';
import {
  ensurePointsAccount,
  tierForPoints,
  pointsToNextLevel,
  LEVEL_TIERS,
} from '@/lib/gamification/points';

/** Get an employee's current level state derived from their points account. */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const employeeId = (params?.userId as string) || user.userId;
    const account = await ensurePointsAccount(user.tenantId, employeeId);
    const tier = tierForPoints(account.totalPoints);
    const span =
      tier.maxPoints === Number.MAX_SAFE_INTEGER ? 1 : tier.maxPoints - tier.minPoints + 1;
    const inLevel = account.totalPoints - tier.minPoints;
    const levelProgress = Math.min(100, Math.round((inLevel / span) * 100));
    return successItem({
      userId: employeeId,
      currentLevel: tier.level,
      currentTier: tier.tier,
      levelName: tier.name,
      totalPoints: account.totalPoints,
      pointsInCurrentLevel: inLevel,
      pointsToNextLevel: pointsToNextLevel(account.totalPoints),
      levelProgress,
      highestLevelAchieved: tier.level,
      maxLevel: LEVEL_TIERS.length,
    });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/levels/users/[userId]' }, 'Failed to get');
    return serverError(error, 'get');
  }
});
