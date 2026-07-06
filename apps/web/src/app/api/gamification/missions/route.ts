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
import { ensurePointsAccount } from '@/lib/gamification/points';

/**
 * List active missions for the tenant, annotated with the current user's
 * progress/status and the streak count from their points account (so the page
 * banner is real, not hardcoded).
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const [missions, userMissions, account] = await Promise.all([
      (prisma as any).gamificationMission.findMany({
        where: { tenantId: user.tenantId, isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
      (prisma as any).gamificationUserMission.findMany({
        where: { tenantId: user.tenantId, employeeId: user.userId },
      }),
      ensurePointsAccount(user.tenantId, user.userId),
    ]);
    const byMission = new Map(userMissions.map((um: any) => [um.missionId, um]));
    const data = missions.map((m: any) => {
      const um = byMission.get(m.id) as any;
      const status = um ? (um.status === 'completed' ? 'Completed' : 'Pending') : 'Pending';
      return {
        missionId: m.id,
        missionName: m.missionName,
        title: m.missionName,
        description: m.description,
        missionType: m.missionType,
        category: m.category,
        pointsReward: m.pointsReward,
        reward: `${m.pointsReward} XP`,
        status,
        progress: um ? um.progress : 0,
      };
    });
    return successList(data, 1, data.length || 1, data.length, {
      currentStreak: account.currentStreak,
      longestStreak: account.longestStreak,
    });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/missions' }, 'Failed to list');
    return serverError(error, 'list');
  }
});

/** Create a mission. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:create')) return forbidden('engagement:create');
    const body = await safeJson(request);
    if (!body || !body.missionName) {
      return validationError({ message: 'missionName is required', messageAr: 'اسم المهمة مطلوب' });
    }
    const created = await (prisma as any).gamificationMission.create({
      data: {
        tenantId: user.tenantId,
        missionName: String(body.missionName),
        description: body.description ? String(body.description) : null,
        missionType: body.missionType ? String(body.missionType) : 'daily',
        category: body.category ? String(body.category) : 'engagement',
        pointsReward: typeof body.pointsReward === 'number' ? body.pointsReward : 0,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/missions' }, 'Failed to create');
    return serverError(error, 'create');
  }
});
