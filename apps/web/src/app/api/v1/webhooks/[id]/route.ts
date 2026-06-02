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
    if (!permissions.includes('webhooks:read')) return forbidden('webhooks:read');
    const row = await prisma.webhook.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!row) return notFound('Webhook');
    return successItem({ ...row, secret: '***REDACTED***' });
  } catch (error: any) {
    return serverError(error, 'fetch webhook');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('webhooks:update')) return forbidden('webhooks:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    delete body.id;
    delete body.tenantId;
    delete body.secret;
    const result = await prisma.webhook.updateMany({
      where: { id: params.id, tenantId: user.tenantId },
      data: body,
    });
    if (result.count === 0) return notFound('Webhook');
    const updated = await prisma.webhook.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    return successItem({ ...updated, secret: '***REDACTED***' });
  } catch (error: any) {
    return serverError(error, 'update webhook');
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('webhooks:delete')) return forbidden('webhooks:delete');
    const result = await prisma.webhook.deleteMany({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (result.count === 0) return notFound('Webhook');
    return successItem({ deleted: true, id: params.id });
  } catch (error: any) {
    return serverError(error, 'delete webhook');
  }
});
