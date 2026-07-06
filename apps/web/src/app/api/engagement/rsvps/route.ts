import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement/events:read')) return forbidden('engagement/events:read');
    const url = new URL(request.url);
    const { page, limit, skip } = parsePagination(url.searchParams);
    const eventId = url.searchParams.get('eventId') || undefined;
    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (eventId) where.eventId = eventId;
    const [rows, total] = await Promise.all([
      (prisma as any).engagementRsvp.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).engagementRsvp.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/rsvps' }, 'Failed to list');
    return serverError(error, 'list');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement/events:read')) return forbidden('engagement/events:read');
    const body = await safeJson(request);
    if (!body || !body.eventId) {
      return validationError({ message: 'eventId is required', messageAr: 'معرّف الفعالية مطلوب' });
    }
    const status = ['GOING', 'MAYBE', 'NOT_GOING'].includes(String(body.status))
      ? String(body.status)
      : 'GOING';
    // Upsert so a user can change their RSVP.
    const existing = await (prisma as any).engagementRsvp.findFirst({
      where: { tenantId: user.tenantId, eventId: String(body.eventId), employeeId: user.userId },
    });
    let rsvp;
    if (existing) {
      rsvp = await (prisma as any).engagementRsvp.update({
        where: { id: existing.id },
        data: { status },
      });
    } else {
      rsvp = await (prisma as any).engagementRsvp.create({
        data: {
          tenantId: user.tenantId,
          eventId: String(body.eventId),
          employeeId: user.userId,
          status,
        },
      });
    }
    // Recompute the event's going count.
    const goingCount = await (prisma as any).engagementRsvp.count({
      where: { tenantId: user.tenantId, eventId: String(body.eventId), status: 'GOING' },
    });
    await (prisma as any).engagementEvent
      .update({ where: { id: String(body.eventId) }, data: { rsvpCount: goingCount } })
      .catch(() => undefined);
    return successItem(rsvp, { status: existing ? 200 : 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/rsvps' }, 'Failed to create');
    return serverError(error, 'create');
  }
});
