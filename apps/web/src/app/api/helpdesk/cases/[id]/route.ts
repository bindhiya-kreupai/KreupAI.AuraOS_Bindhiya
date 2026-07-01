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

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:read')) return forbidden('helpdesk:read');
    const row = await (prisma as any).helpdeskCase.findFirst({
      where: { id: params.id, tenantId: user.tenantId, isDeleted: false },
      include: { notes: { orderBy: { createdAt: 'asc' } } },
    });
    if (!row) return notFound('Case');
    return successItem(row);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/cases/[id]' }, 'Failed to get');
    return serverError(error, 'get case');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:update')) return forbidden('helpdesk:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const existing = await (prisma as any).helpdeskCase.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!existing) return notFound('Case');
    const {
      tenantId: _t,
      id: _i,
      createdBy: _cb,
      notes: _n,
      ...data
    } = body as Record<string, unknown>;
    if (data.status === 'CLOSED' && !data.closedAt) data.closedAt = new Date();
    const updated = await (prisma as any).helpdeskCase.update({
      where: { id: params.id },
      data: { ...data, updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/cases/[id]' }, 'Failed to update');
    return serverError(error, 'update case');
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:delete')) return forbidden('helpdesk:delete');
    const existing = await (prisma as any).helpdeskCase.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!existing) return notFound('Case');
    const updated = await (prisma as any).helpdeskCase.update({
      where: { id: params.id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/cases/[id]' }, 'Failed to delete');
    return serverError(error, 'delete case');
  }
});
