import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';
import { ensurePointsAccount, tierForPoints, pointsToNextLevel } from '@/lib/gamification/points';

/**
 * Get the points account for a specific employee (tenant-scoped). A row is
 * lazily created on first read so a brand-new employee sees a zeroed account
 * rather than a 404.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const employeeId = (params?.userId as string) || user.userId;
    const account = await ensurePointsAccount(user.tenantId, employeeId);
    const tier = tierForPoints(account.totalPoints);
    return successItem({
      accountId: account.id,
      userId: account.employeeId,
      totalPoints: account.totalPoints,
      lifetimePoints: account.lifetimePoints,
      currentBalance: account.currentBalance,
      currentLevel: tier.level,
      currentTier: tier.tier,
      levelName: tier.name,
      pointsToNextLevel: pointsToNextLevel(account.totalPoints),
      currentStreak: account.currentStreak,
      longestStreak: account.longestStreak,
    });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/points/accounts/[userId]' }, 'Failed to get');
    return serverError(error, 'get');
  }
});
