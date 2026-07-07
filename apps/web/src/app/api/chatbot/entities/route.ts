import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const entityType = searchParams.get('entityType');
    const status = searchParams.get('status');
    const where: any = { tenantId, isDeleted: false };
    if (entityType) where.entityType = entityType;
    if (status) where.status = status;
    const [rows, total] = await Promise.all([
      prisma.chatbotEntity.findMany({ where, orderBy: { updatedAt: 'desc' }, skip, take: limit }),
      prisma.chatbotEntity.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list entities');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body?.entityName) return validationError({ message: 'entityName is required' });
    const record = await prisma.chatbotEntity.create({
      data: {
        tenantId,
        createdBy: userId,
        entityName: body.entityName,
        entityType: body.entityType ?? 'custom',
        description: body.description ?? null,
        values: body.values ?? [],
        fuzzyMatching: body.fuzzyMatching ?? false,
        isCaseSensitive: body.isCaseSensitive ?? false,
        status: body.status ?? 'active',
      },
    });
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create entity');
  }
});
