import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';

/** List an employee's missions (defaults to the current user). */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const employeeId = new URL(request.url).searchParams.get('userId') || user.userId;
    const rows = await (prisma as any).gamificationUserMission.findMany({
      where: { tenantId: user.tenantId, employeeId },
      orderBy: { startedAt: 'desc' },
    });
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/missions/users' }, 'Failed to list');
    return serverError(error, 'list');
  }
});
