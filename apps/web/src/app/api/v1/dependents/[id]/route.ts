import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
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
    const { user, params, permissions } = context;
    if (!permissions.includes('dependents:read')) return forbidden('dependents:read');
    const row = await prisma.dependent.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!row) return notFound('Dependent');
    return successItem(row);
  } catch (error: any) {
    return serverError(error, 'fetch dependent');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('dependents:update')) return forbidden('dependents:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    delete body.id;
    delete body.tenantId;
    delete body.createdAt;
    const result = await prisma.dependent.updateMany({
      where: { id: params.id, tenantId: user.tenantId },
      data: body,
    });
    if (result.count === 0) return notFound('Dependent');
    const updated = await prisma.dependent.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    return successItem(updated);
  } catch (error: any) {
    return serverError(error, 'update dependent');
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('dependents:delete')) return forbidden('dependents:delete');
    const result = await prisma.dependent.deleteMany({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (result.count === 0) return notFound('Dependent');
    return successItem({ deleted: true, id: params.id });
  } catch (error: any) {
    return serverError(error, 'delete dependent');
  }
});
