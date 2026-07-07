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
    if (!permissions.includes('helpdesk/tickets:read')) return forbidden('helpdesk/tickets:read');
    const row = await (prisma as any).helpdeskTicket.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!row) return notFound('Ticket');
    return successItem(row);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/tickets/[id]' }, 'Failed to get');
    return serverError(error, 'get');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk/tickets:update'))
      return forbidden('helpdesk/tickets:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const existing = await (prisma as any).helpdeskTicket.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!existing) return notFound('Ticket');
    // Never let a client overwrite tenant/ownership scoping.
    const {
      tenantId: _t,
      id: _i,
      createdBy: _cb,
      createdAt: _ca,
      ...updatable
    } = body as Record<string, unknown>;
    if (updatable.status === 'RESOLVED' && !updatable.resolvedAt) updatable.resolvedAt = new Date();
    if (updatable.status === 'CLOSED' && !updatable.closedAt) updatable.closedAt = new Date();
    const updated = await (prisma as any).helpdeskTicket.update({
      where: { id: params.id },
      data: { ...updatable, updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/tickets/[id]' }, 'Failed to update');
    return serverError(error, 'update');
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk/tickets:delete'))
      return forbidden('helpdesk/tickets:delete');
    const existing = await (prisma as any).helpdeskTicket.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!existing) return notFound('Ticket');
    const updated = await (prisma as any).helpdeskTicket.update({
      where: { id: params.id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/tickets/[id]' }, 'Failed to delete');
    return serverError(error, 'delete');
  }
});
