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
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId, isDeleted: false };
    const [rows, total] = await Promise.all([
      (prisma as any).engagementNewsletter.findMany({
        where,
        orderBy: [{ publishDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      (prisma as any).engagementNewsletter.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/newsletters' }, 'Failed to list');
    return serverError(error, 'list');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:create')) return forbidden('engagement:create');
    const body = await safeJson(request);
    if (!body || !body.title) {
      return validationError({ message: 'title is required', messageAr: 'العنوان مطلوب' });
    }
    const created = await (prisma as any).engagementNewsletter.create({
      data: {
        tenantId: user.tenantId,
        title: String(body.title),
        excerpt: body.excerpt ? String(body.excerpt) : null,
        content: body.content ? String(body.content) : null,
        category: body.category ? String(body.category) : null,
        editionNumber: typeof body.editionNumber === 'number' ? body.editionNumber : 1,
        status: body.status ? String(body.status) : 'DRAFT',
        publishDate: body.publishDate ? new Date(body.publishDate) : null,
        coverImageUrl: body.coverImageUrl ? String(body.coverImageUrl) : null,
        editorId: user.userId,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/newsletters' }, 'Failed to create');
    return serverError(error, 'create');
  }
});
