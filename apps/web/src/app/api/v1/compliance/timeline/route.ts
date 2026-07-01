import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError } from '@/lib/api/crud-helpers';
import { DEFAULT_TIMELINE_SEED, mapTimelineEvent } from '../_lib/compliance-mappers';

/**
 * GET /api/v1/compliance/timeline
 * Returns ComplianceTimeline[] (bare array), sorted by date ascending.
 * Seeds a few default events the first time a tenant has zero.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('compliance/timeline:read')) {
      return forbidden('compliance/timeline:read');
    }

    const tenantId = user.tenantId;
    const count = await (prisma as any).complianceTimelineEvent.count({ where: { tenantId } });

    if (count === 0) {
      for (const ev of DEFAULT_TIMELINE_SEED) {
        const { frameworkCode, ...rest } = ev;
        await (prisma as any).complianceTimelineEvent.create({
          data: {
            ...rest,
            frameworkId: frameworkCode,
            completed: false,
            tenantId,
            createdBy: user.userId,
            updatedBy: user.userId,
          },
        });
      }
    }

    const rows = await (prisma as any).complianceTimelineEvent.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(rows.map(mapTimelineEvent));
  } catch (error: any) {
    logger.error(
      { err: error, route: 'v1/compliance/timeline/route.ts' },
      'Failed to list timeline'
    );
    return serverError(error, 'list compliance timeline');
  }
});
