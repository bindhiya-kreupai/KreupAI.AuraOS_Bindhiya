import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';
import { LEVEL_TIERS } from '@/lib/gamification/points';

/**
 * Level definitions (the progression ladder) annotated with the tenant's user
 * distribution across levels.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const accounts = await (prisma as any).gamificationPointsAccount.findMany({
      where: { tenantId: user.tenantId },
      select: { currentLevel: true },
    });
    const total = accounts.length || 0;
    const countByLevel = new Map<number, number>();
    for (const a of accounts) {
      countByLevel.set(a.currentLevel, (countByLevel.get(a.currentLevel) || 0) + 1);
    }
    const data = LEVEL_TIERS.map((t) => {
      const users = countByLevel.get(t.level) || 0;
      return {
        level: t.level,
        levelName: t.name,
        tier: t.tier,
        pointsRequired: t.minPoints,
        pointsRange: { min: t.minPoints, max: t.maxPoints },
        totalUsers: users,
        percentageOfUsers: total ? Math.round((users / total) * 100) : 0,
        displayOrder: t.level,
      };
    });
    return successList(data, 1, data.length, data.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/levels/definitions' }, 'Failed to list');
    return serverError(error, 'list');
  }
});
