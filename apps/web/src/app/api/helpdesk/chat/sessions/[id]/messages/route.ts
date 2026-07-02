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

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:read')) return forbidden('helpdesk:read');
    const session = await (prisma as any).helpdeskChatSession.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!session) return notFound('Chat session');
    const sinceParam = new URL(request.url).searchParams.get('since');
    const where: Record<string, unknown> = { tenantId: user.tenantId, sessionId: params.id };
    if (sinceParam) {
      const since = new Date(sinceParam);
      if (!Number.isNaN(since.getTime())) where.createdAt = { gt: since };
    }
    const rows = await (prisma as any).helpdeskChatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/chat/messages' }, 'Failed to list');
    return serverError(error, 'list chat messages');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:update')) return forbidden('helpdesk:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const content = String(body.content ?? '').trim();
    if (!content) return validationError({ message: 'content is required', field: 'content' });
    const session = await (prisma as any).helpdeskChatSession.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true, requesterId: true },
    });
    if (!session) return notFound('Chat session');
    const senderType =
      body.senderType === 'agent' || session.requesterId !== user.userId ? 'agent' : 'requester';
    const created = await (prisma as any).helpdeskChatMessage.create({
      data: {
        tenantId: user.tenantId,
        sessionId: params.id,
        senderId: user.userId,
        senderType,
        content,
      },
    });
    await (prisma as any).helpdeskChatSession.update({
      where: { id: params.id },
      data: { lastMessageAt: new Date() },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/chat/messages' }, 'Failed to send');
    return serverError(error, 'send chat message');
  }
});
