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
    if (!permissions.includes('benefits:read')) return forbidden('benefits:read');
    const row = await prisma.benefitPlan.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!row) return notFound('Benefit plan');
    return successItem(row);
  } catch (error: any) {
    return serverError(error, 'fetch plan');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('benefits:update')) return forbidden('benefits:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    delete body.id;
    delete body.tenantId;
    const result = await prisma.benefitPlan.updateMany({
      where: { id: params.id, tenantId: user.tenantId },
      data: body,
    });
    if (result.count === 0) return notFound('Benefit plan');
    const updated = await prisma.benefitPlan.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    return successItem(updated);
  } catch (error: any) {
    return serverError(error, 'update plan');
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('benefits:delete')) return forbidden('benefits:delete');
    const result = await prisma.benefitPlan.deleteMany({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (result.count === 0) return notFound('Benefit plan');
    return successItem({ deleted: true, id: params.id });
  } catch (error: any) {
    return serverError(error, 'delete plan');
  }
});
