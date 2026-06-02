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
    const { user, params, permissions } = context;
    if (!permissions.includes('admin/forms:read')) return forbidden('admin/forms:read');
    const form = await prisma.adminForm.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!form) return notFound('Form');
    return successItem(form);
  } catch (error: any) {
    return serverError(error, 'fetch form');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('admin/forms:update')) return forbidden('admin/forms:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    delete body.id;
    delete body.tenantId;
    delete body.createdAt;
    const result = await prisma.adminForm.updateMany({
      where: { id: params.id, tenantId: user.tenantId },
      data: body,
    });
    if (result.count === 0) return notFound('Form');
    const updated = await prisma.adminForm.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    return successItem(updated);
  } catch (error: any) {
    return serverError(error, 'update form');
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('admin/forms:delete')) return forbidden('admin/forms:delete');
    const result = await prisma.adminForm.deleteMany({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (result.count === 0) return notFound('Form');
    return successItem({ deleted: true, id: params.id });
  } catch (error: any) {
    return serverError(error, 'delete form');
  }
});
