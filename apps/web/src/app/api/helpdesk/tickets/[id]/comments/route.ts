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
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk/tickets:read')) return forbidden('helpdesk/tickets:read');
    const rows = await (prisma as any).helpdeskTicketComment.findMany({
      where: { tenantId: user.tenantId, ticketId: params.id },
      orderBy: { createdAt: 'asc' },
    });
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/tickets/[id]/comments' }, 'Failed to list');
    return serverError(error, 'list comments');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk/tickets:update'))
      return forbidden('helpdesk/tickets:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const content = String(body.content ?? '').trim();
    if (!content) return validationError({ message: 'content is required', field: 'content' });
    const ticket = await (prisma as any).helpdeskTicket.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!ticket) return notFound('Ticket');
    const created = await (prisma as any).helpdeskTicketComment.create({
      data: {
        tenantId: user.tenantId,
        ticketId: params.id,
        authorId: user.userId,
        authorName: body.authorName ?? null,
        commentType: body.commentType === 'internal' ? 'internal' : 'public',
        content,
      },
    });
    // Touch the ticket so updatedAt reflects the new activity.
    await (prisma as any).helpdeskTicket.update({
      where: { id: params.id },
      data: { updatedBy: user.userId },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/tickets/[id]/comments' }, 'Failed to add comment');
    return serverError(error, 'add comment');
  }
});
