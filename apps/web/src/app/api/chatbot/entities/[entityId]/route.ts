import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  safeJson,
  serverError,
  successItem,
  notFound,
  validationError,
} from '@/lib/api/crud-helpers';

async function getEntity(tenantId: string, entityId: string) {
  return prisma.chatbotEntity.findFirst({
    where: { id: entityId, tenantId, isDeleted: false },
  });
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const record = await getEntity(tenantId, context.params.entityId);
    if (!record) return notFound('Entity');
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'get entity');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const entityId = context.params.entityId;
    const existing = await getEntity(tenantId, entityId);
    if (!existing) return notFound('Entity');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Request body required' });
    const record = await prisma.chatbotEntity.update({
      where: { id: entityId },
      data: {
        ...(body.entityName !== undefined && { entityName: body.entityName }),
        ...(body.entityType !== undefined && { entityType: body.entityType }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.values !== undefined && { values: body.values }),
        ...(body.fuzzyMatching !== undefined && { fuzzyMatching: body.fuzzyMatching }),
        ...(body.isCaseSensitive !== undefined && { isCaseSensitive: body.isCaseSensitive }),
        ...(body.status !== undefined && { status: body.status }),
        updatedBy: userId,
      },
    });
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'update entity');
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const entityId = context.params.entityId;
    const existing = await getEntity(tenantId, entityId);
    if (!existing) return notFound('Entity');
    await prisma.chatbotEntity.update({
      where: { id: entityId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });
    return successItem({ deleted: true });
  } catch (error: any) {
    return serverError(error, 'delete entity');
  }
});
