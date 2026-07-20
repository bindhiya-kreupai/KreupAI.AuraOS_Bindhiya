import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('helpdesk:read')) return forbidden('helpdesk:read');
    const query = String(new URL(request.url).searchParams.get('query') ?? '').trim();
    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ];
    }
    const rows = await (prisma as any).helpdeskKnowledgeArticle.findMany({
      where,
      orderBy: { views: 'desc' },
      take: 50,
    });
    return successList(rows, 1, rows.length || 1, rows.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/knowledge-base/search' }, 'Failed to search');
    return serverError(error, 'search articles');
  }
});
