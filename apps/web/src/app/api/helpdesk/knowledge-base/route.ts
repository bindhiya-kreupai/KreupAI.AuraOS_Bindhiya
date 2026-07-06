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
    if (!permissions.includes('helpdesk:read')) return forbidden('helpdesk:read');
    const sp = new URL(request.url).searchParams;
    const { page, limit, skip } = parsePagination(sp);
    const category = sp.get('category');
    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (category) where.category = category;
    const [rows, total] = await Promise.all([
      (prisma as any).helpdeskKnowledgeArticle.findMany({
        where,
        orderBy: { views: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).helpdeskKnowledgeArticle.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/knowledge-base' }, 'Failed to list');
    return serverError(error, 'list articles');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('helpdesk:create')) return forbidden('helpdesk:create');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    if (!String(body.title ?? '').trim())
      return validationError({ message: 'title is required', field: 'title' });
    const { tenantId: _t, id: _i, ...data } = body as Record<string, unknown>;
    const created = await (prisma as any).helpdeskKnowledgeArticle.create({
      data: { ...data, tenantId: user.tenantId, createdBy: user.userId, author: user.userId },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/knowledge-base' }, 'Failed to create');
    return serverError(error, 'create article');
  }
});
