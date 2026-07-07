import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

/** Get a single badge definition (tenant-scoped). */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const badgeId = params?.badgeId as string;
    const badge = await (prisma as any).gamificationBadge.findFirst({
      where: { id: badgeId, tenantId: user.tenantId },
    });
    if (!badge) return notFound('Badge');
    return successItem(badge);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/badges/[badgeId]' }, 'Failed to get');
    return serverError(error, 'get');
  }
});
