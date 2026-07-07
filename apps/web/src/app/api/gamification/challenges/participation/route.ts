import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';

/** List challenge participations (filterable by challengeId / userId). */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const url = new URL(request.url);
    const where: any = { tenantId: user.tenantId };
    const challengeId = url.searchParams.get('challengeId');
    const userId = url.searchParams.get('userId');
    if (challengeId) where.challengeId = challengeId;
    if (userId) where.employeeId = userId;
    const rows = await (prisma as any).gamificationChallengeParticipation.findMany({
      where,
      orderBy: { joinedAt: 'desc' },
    });
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/challenges/participation' }, 'Failed to list');
    return serverError(error, 'list');
  }
});
