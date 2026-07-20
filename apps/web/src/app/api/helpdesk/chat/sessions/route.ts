import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, safeJson, serverError, successItem, successList } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('helpdesk:read')) return forbidden('helpdesk:read');
    const sp = new URL(request.url).searchParams;
    const mine = sp.get('mine') === 'true';
    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (mine) where.requesterId = user.userId;
    const status = sp.get('status');
    if (status) where.status = status;
    const rows = await (prisma as any).helpdeskChatSession.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      take: 50,
    });
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/chat/sessions' }, 'Failed to list');
    return serverError(error, 'list chat sessions');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('helpdesk:create')) return forbidden('helpdesk:create');
    const body = (await safeJson(request)) ?? {};
    const created = await (prisma as any).helpdeskChatSession.create({
      data: {
        tenantId: user.tenantId,
        subject: body.subject ?? 'Live chat',
        requesterId: user.userId,
        agentId: body.agentId ?? null,
        status: 'ACTIVE',
        createdBy: user.userId,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/chat/sessions' }, 'Failed to create');
    return serverError(error, 'create chat session');
  }
});
