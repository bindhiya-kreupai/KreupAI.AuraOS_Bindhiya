import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';

/**
 * Achievement wall entries for an employee (defaults to the current user).
 * Achievements are derived from earned badges — each earned badge is surfaced as
 * a "badge_earned" achievement so the wall reflects real accomplishments.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const employeeId = new URL(request.url).searchParams.get('userId') || user.userId;
    const userBadges = await (prisma as any).gamificationUserBadge.findMany({
      where: { tenantId: user.tenantId, employeeId },
      orderBy: { awardedAt: 'desc' },
    });
    const badgeIds = userBadges.map((ub: any) => ub.badgeId);
    const badges = badgeIds.length
      ? await (prisma as any).gamificationBadge.findMany({
          where: { tenantId: user.tenantId, id: { in: badgeIds } },
        })
      : [];
    const badgeMap = new Map(badges.map((b: any) => [b.id, b]));
    const data = userBadges.map((ub: any) => {
      const b = badgeMap.get(ub.badgeId) as any;
      return {
        achievementId: ub.id,
        userId: ub.employeeId,
        achievementType: 'badge_earned',
        title: b?.badgeName || 'Achievement',
        description: b?.description || '',
        sourceType: 'badge',
        sourceId: ub.badgeId,
        icon: b?.icon || 'Trophy',
        achievementDate: ub.awardedAt,
        date: ub.awardedAt,
      };
    });
    return successList(data, 1, data.length || 1, data.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/achievements' }, 'Failed to list');
    return serverError(error, 'list');
  }
});
