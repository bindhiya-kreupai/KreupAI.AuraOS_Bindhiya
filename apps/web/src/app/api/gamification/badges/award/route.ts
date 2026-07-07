import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  notFound,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';
import { applyPointsDelta } from '@/lib/gamification/points';

/**
 * Award a badge to an employee. Idempotent per (tenant, employee, badge); on
 * first award the badge's points are credited to the employee's account.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:create')) return forbidden('engagement:create');
    const body = await safeJson(request);
    if (!body || !body.badgeId) {
      return validationError({ message: 'badgeId is required', messageAr: 'معرّف الشارة مطلوب' });
    }
    const employeeId = body.userId ? String(body.userId) : user.userId;
    const badge = await (prisma as any).gamificationBadge.findFirst({
      where: { id: String(body.badgeId), tenantId: user.tenantId, isActive: true },
    });
    if (!badge) return notFound('Badge');

    const existing = await (prisma as any).gamificationUserBadge.findFirst({
      where: { tenantId: user.tenantId, employeeId, badgeId: badge.id },
    });
    if (existing) {
      return validationError({
        message: 'Badge already earned',
        messageAr: 'تم الحصول على الشارة بالفعل',
      });
    }

    const userBadge = await (prisma as any).gamificationUserBadge.create({
      data: {
        tenantId: user.tenantId,
        employeeId,
        badgeId: badge.id,
        reason: body.reason ? String(body.reason) : null,
      },
    });

    if (badge.pointsAwarded > 0) {
      await applyPointsDelta({
        tenantId: user.tenantId,
        employeeId,
        amount: badge.pointsAwarded,
        type: 'bonus',
        category: 'recognition',
        source: 'badge',
        reason: `Earned badge: ${badge.badgeName}`,
      });
    }

    return successItem(userBadge, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/badges/award' }, 'Failed to award');
    return serverError(error, 'award');
  }
});
