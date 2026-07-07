import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

const TIER_STYLES: Record<string, { bg: string; color: string }> = {
  bronze: { bg: 'bg-amber-100 dark:bg-amber-900/20', color: 'text-amber-700' },
  silver: { bg: 'bg-slate-100 dark:bg-slate-800', color: 'text-slate-500' },
  gold: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', color: 'text-yellow-600' },
  platinum: { bg: 'bg-indigo-100 dark:bg-indigo-900/20', color: 'text-indigo-600' },
  diamond: { bg: 'bg-cyan-100 dark:bg-cyan-900/20', color: 'text-cyan-600' },
};

/**
 * List badges for the tenant, annotated with whether the current user has
 * earned each one. The response shape matches the badges page: title, desc,
 * tier, icon (lucide name), status (Unlocked/Locked), and tier styling.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const [badges, earned] = await Promise.all([
      (prisma as any).gamificationBadge.findMany({
        where: { tenantId: user.tenantId, isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
      (prisma as any).gamificationUserBadge.findMany({
        where: { tenantId: user.tenantId, employeeId: user.userId },
      }),
    ]);
    const earnedSet = new Set(earned.map((e: any) => e.badgeId));
    const data = badges.map((b: any) => {
      const style = TIER_STYLES[b.tier] || TIER_STYLES.bronze;
      return {
        badgeId: b.id,
        badgeCode: b.badgeCode,
        badgeName: b.badgeName,
        title: b.badgeName,
        description: b.description,
        desc: b.description || '',
        icon: b.icon,
        tier: b.tier,
        category: b.category,
        pointsAwarded: b.pointsAwarded,
        status: earnedSet.has(b.id) ? 'Unlocked' : 'Locked',
        earned: earnedSet.has(b.id),
        bg: style.bg,
        color: style.color,
      };
    });
    return successList(data, 1, data.length || 1, data.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/badges' }, 'Failed to list');
    return serverError(error, 'list');
  }
});

/** Create a badge definition. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:create')) return forbidden('engagement:create');
    const body = await safeJson(request);
    if (!body || !body.badgeName) {
      return validationError({ message: 'badgeName is required', messageAr: 'اسم الشارة مطلوب' });
    }
    const created = await (prisma as any).gamificationBadge.create({
      data: {
        tenantId: user.tenantId,
        badgeCode: body.badgeCode
          ? String(body.badgeCode)
          : String(body.badgeName).toLowerCase().replace(/\s+/g, '_'),
        badgeName: String(body.badgeName),
        description: body.description ? String(body.description) : null,
        icon: body.icon ? String(body.icon) : 'Medal',
        tier: body.tier ? String(body.tier) : 'bronze',
        category: body.category ? String(body.category) : 'achievement',
        pointsAwarded: typeof body.pointsAwarded === 'number' ? body.pointsAwarded : 0,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/badges' }, 'Failed to create');
    return serverError(error, 'create');
  }
});
