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

/**
 * List challenges for the tenant, annotated with participant counts and whether
 * the current user has joined each one.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const challenges = await (prisma as any).gamificationChallenge.findMany({
      where: { tenantId: user.tenantId, status: { in: ['active', 'upcoming'] } },
      orderBy: [{ isFeatured: 'desc' }, { endDate: 'asc' }],
    });
    const ids = challenges.map((c: any) => c.id);
    const participations = ids.length
      ? await (prisma as any).gamificationChallengeParticipation.findMany({
          where: { tenantId: user.tenantId, challengeId: { in: ids } },
        })
      : [];
    const countByChallenge = new Map<string, number>();
    const myByChallenge = new Map<string, any>();
    for (const p of participations) {
      countByChallenge.set(p.challengeId, (countByChallenge.get(p.challengeId) || 0) + 1);
      if (p.employeeId === user.userId) myByChallenge.set(p.challengeId, p);
    }
    const now = Date.now();
    const data = challenges.map((c: any) => {
      const mine = myByChallenge.get(c.id);
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(c.endDate).getTime() - now) / (1000 * 60 * 60 * 24))
      );
      return {
        challengeId: c.id,
        challengeName: c.challengeName,
        title: c.challengeName,
        description: c.description,
        desc: c.description || '',
        category: c.category,
        difficulty: c.difficulty,
        pointsReward: c.pointsReward,
        reward: `${c.pointsReward} XP`,
        targetValue: c.targetValue,
        targetUnit: c.targetUnit,
        startDate: c.startDate,
        endDate: c.endDate,
        daysLeft,
        status: c.status,
        isFeatured: c.isFeatured,
        totalParticipants: countByChallenge.get(c.id) || 0,
        joined: Boolean(mine),
        myProgress: mine ? mine.progress : 0,
        myCurrentValue: mine ? mine.currentValue : 0,
      };
    });
    return successList(data, 1, data.length || 1, data.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/challenges' }, 'Failed to list');
    return serverError(error, 'list');
  }
});

/** Create a challenge. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:create')) return forbidden('engagement:create');
    const body = await safeJson(request);
    if (!body || !body.challengeName || !body.endDate) {
      return validationError({
        message: 'challengeName and endDate are required',
        messageAr: 'اسم التحدي وتاريخ الانتهاء مطلوبان',
      });
    }
    const created = await (prisma as any).gamificationChallenge.create({
      data: {
        tenantId: user.tenantId,
        challengeName: String(body.challengeName),
        description: body.description ? String(body.description) : null,
        category: body.category ? String(body.category) : 'engagement',
        difficulty: body.difficulty ? String(body.difficulty) : 'medium',
        pointsReward: typeof body.pointsReward === 'number' ? body.pointsReward : 0,
        targetValue: typeof body.targetValue === 'number' ? body.targetValue : 1,
        targetUnit: body.targetUnit ? String(body.targetUnit) : 'tasks',
        endDate: new Date(body.endDate),
        isFeatured: Boolean(body.isFeatured),
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/challenges' }, 'Failed to create');
    return serverError(error, 'create');
  }
});
