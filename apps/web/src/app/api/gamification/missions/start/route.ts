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

/** Start a mission for the current user (idempotent per mission). */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const body = await safeJson(request);
    if (!body || !body.missionId) {
      return validationError({ message: 'missionId is required', messageAr: 'معرّف المهمة مطلوب' });
    }
    const mission = await (prisma as any).gamificationMission.findFirst({
      where: { id: String(body.missionId), tenantId: user.tenantId, isActive: true },
    });
    if (!mission) return notFound('Mission');

    const existing = await (prisma as any).gamificationUserMission.findFirst({
      where: { tenantId: user.tenantId, employeeId: user.userId, missionId: mission.id },
    });
    if (existing) return successItem(existing);

    const created = await (prisma as any).gamificationUserMission.create({
      data: {
        tenantId: user.tenantId,
        employeeId: user.userId,
        missionId: mission.id,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/missions/start' }, 'Failed to start');
    return serverError(error, 'start');
  }
});
