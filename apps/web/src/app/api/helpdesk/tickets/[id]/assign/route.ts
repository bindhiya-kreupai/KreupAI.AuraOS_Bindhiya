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

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk/tickets:update'))
      return forbidden('helpdesk/tickets:update');
    const body = (await safeJson(request)) ?? {};
    // When no assignee is supplied this is a self-assignment; the current user
    // is always derived from the auth context, never trusted from the client.
    const assigneeId = body.assigneeId ?? body.agentId ?? user.userId;
    if (!assigneeId)
      return validationError({ message: 'assigneeId is required', field: 'assigneeId' });
    const existing = await (prisma as any).helpdeskTicket.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true, status: true },
    });
    if (!existing) return notFound('Ticket');
    const updated = await (prisma as any).helpdeskTicket.update({
      where: { id: params.id },
      data: {
        assigneeId,
        status: existing.status === 'OPEN' ? 'IN_PROGRESS' : existing.status,
        updatedBy: user.userId,
      },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/tickets/[id]/assign' }, 'Failed to assign');
    return serverError(error, 'assign');
  }
});
