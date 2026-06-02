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
    if (!permissions.includes('attendance:read')) return forbidden('attendance:read');
    const row = await prisma.shiftRoster.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!row) return notFound('Schedule');
    return successItem(row);
  } catch (error: any) {
    return serverError(error, 'fetch schedule');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('attendance:write')) return forbidden('attendance:write');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    delete body.id;
    delete body.tenantId;
    const result = await prisma.shiftRoster.updateMany({
      where: { id: params.id, tenantId: user.tenantId },
      data: body,
    });
    if (result.count === 0) return notFound('Schedule');
    const updated = await prisma.shiftRoster.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    return successItem(updated);
  } catch (error: any) {
    return serverError(error, 'update schedule');
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('attendance:write')) return forbidden('attendance:write');
    const result = await prisma.shiftRoster.deleteMany({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (result.count === 0) return notFound('Schedule');
    return successItem({ deleted: true, id: params.id });
  } catch (error: any) {
    return serverError(error, 'delete schedule');
  }
});
