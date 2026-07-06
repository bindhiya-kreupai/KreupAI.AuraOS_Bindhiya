import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';

/** List badges earned by an employee (defaults to the current user). */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const employeeId = new URL(request.url).searchParams.get('userId') || user.userId;
    const rows = await (prisma as any).gamificationUserBadge.findMany({
      where: { tenantId: user.tenantId, employeeId },
      orderBy: { awardedAt: 'desc' },
    });
    const badgeIds = rows.map((r: any) => r.badgeId);
    const badges = badgeIds.length
      ? await (prisma as any).gamificationBadge.findMany({
          where: { tenantId: user.tenantId, id: { in: badgeIds } },
        })
      : [];
    const badgeMap = new Map(badges.map((b: any) => [b.id, b]));
    const data = rows.map((r: any) => ({
      userBadgeId: r.id,
      userId: r.employeeId,
      badgeId: r.badgeId,
      badge: badgeMap.get(r.badgeId) || null,
      awardedDate: r.awardedAt,
      reason: r.reason,
    }));
    return successList(data, 1, data.length || 1, data.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/badges/users' }, 'Failed to list');
    return serverError(error, 'list');
  }
});
