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
    if (!permissions.includes('industry-manufacturing/maintenance:read'))
      return forbidden('industry-manufacturing/maintenance:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId };
    const [rows, total] = await Promise.all([
      (prisma as any).manufacturingWorkOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).manufacturingWorkOrder.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'industry-manufacturing/maintenance/work-orders/route.ts' },
      'Failed to list'
    );
    return serverError(error, 'list');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('industry-manufacturing/maintenance:create'))
      return forbidden('industry-manufacturing/maintenance:create');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const created = await (prisma as any).manufacturingWorkOrder.create({
      data: {
        ...body,
        tenantId: user.tenantId,
        createdBy: user.userId,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'industry-manufacturing/maintenance/work-orders/route.ts' },
      'Failed to create'
    );
    return serverError(error, 'create');
  }
});
