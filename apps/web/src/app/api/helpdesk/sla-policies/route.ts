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

// Canonical alias for the SLA policy resource. The sibling helpdesk services
// (SLATrackingService) call /helpdesk/sla-policies; the underlying store is the
// existing HelpdeskSLA model (also exposed at /helpdesk/sla).

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('helpdesk/sla:read')) return forbidden('helpdesk/sla:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId };
    const [rows, total] = await Promise.all([
      (prisma as any).helpdeskSLA.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).helpdeskSLA.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/sla-policies' }, 'Failed to list');
    return serverError(error, 'list sla policies');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('helpdesk/sla:create')) return forbidden('helpdesk/sla:create');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const { tenantId: _t, id: _i, ...data } = body as Record<string, unknown>;
    const created = await (prisma as any).helpdeskSLA.create({
      data: { ...data, tenantId: user.tenantId, createdBy: user.userId },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/sla-policies' }, 'Failed to create');
    return serverError(error, 'create sla policy');
  }
});
