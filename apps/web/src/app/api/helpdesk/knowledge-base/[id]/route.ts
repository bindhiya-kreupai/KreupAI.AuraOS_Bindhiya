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
    const row = await (prisma as any).helpdeskKnowledgeArticle.findFirst({
      where: { id: params.id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!row) return notFound('Article');
    // Best-effort view increment; never block the read.
    (prisma as any).helpdeskKnowledgeArticle
      .update({ where: { id: params.id }, data: { views: { increment: 1 } } })
      .catch(() => undefined);
    return successItem(row);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/knowledge-base/[id]' }, 'Failed to get');
    return serverError(error, 'get article');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:update')) return forbidden('helpdesk:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const existing = await (prisma as any).helpdeskKnowledgeArticle.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!existing) return notFound('Article');
    const { tenantId: _t, id: _i, createdBy: _cb, ...data } = body as Record<string, unknown>;
    const updated = await (prisma as any).helpdeskKnowledgeArticle.update({
      where: { id: params.id },
      data: { ...data, updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/knowledge-base/[id]' }, 'Failed to update');
    return serverError(error, 'update article');
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('helpdesk:delete')) return forbidden('helpdesk:delete');
    const existing = await (prisma as any).helpdeskKnowledgeArticle.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!existing) return notFound('Article');
    const updated = await (prisma as any).helpdeskKnowledgeArticle.update({
      where: { id: params.id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/knowledge-base/[id]' }, 'Failed to delete');
    return serverError(error, 'delete article');
  }
});
