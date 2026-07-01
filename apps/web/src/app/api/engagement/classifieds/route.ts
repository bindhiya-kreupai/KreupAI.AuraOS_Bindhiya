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
    const url = new URL(request.url);
    const { page, limit, skip } = parsePagination(url.searchParams);
    const category = url.searchParams.get('category') || undefined;
    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
      isDeleted: false,
      status: 'ACTIVE',
    };
    if (category && category !== 'All') where.category = category;
    const [rows, total] = await Promise.all([
      (prisma as any).engagementClassified.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).engagementClassified.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/classifieds' }, 'Failed to list');
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
    const created = await (prisma as any).engagementClassified.create({
      data: {
        tenantId: user.tenantId,
        title: String(body.title),
        description: body.description ? String(body.description) : null,
        category: body.category ? String(body.category) : 'OTHER',
        price: typeof body.price === 'number' ? body.price : null,
        currency: body.currency ? String(body.currency) : 'USD',
        condition: body.condition ? String(body.condition) : null,
        status: 'ACTIVE',
        sellerId: user.userId,
        sellerName: body.sellerName ? String(body.sellerName) : user.name || null,
        imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/classifieds' }, 'Failed to create');
    return serverError(error, 'create');
  }
});
