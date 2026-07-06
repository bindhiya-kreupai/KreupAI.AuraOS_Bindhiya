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
    const { user, permissions, params } = context;
    if (!permissions.includes('health-safety/incidents:read'))
      return forbidden('health-safety/incidents:read');
    const row = await (prisma as any).healthSafetyIncident.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!row) return notFound('Incident');
    return successItem(row);
  } catch (error: any) {
    logger.error({ err: error, route: 'health-safety/incidents/[id]/route.ts' }, 'Failed to get');
    return serverError(error, 'get');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('health-safety/incidents:update'))
      return forbidden('health-safety/incidents:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const existing = await (prisma as any).healthSafetyIncident.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!existing) return notFound('Incident');
    const { tenantId: _t, id: _id, createdBy: _c, ...data } = body;
    const updated = await (prisma as any).healthSafetyIncident.update({
      where: { id: params.id },
      data: { ...data, updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'health-safety/incidents/[id]/route.ts' },
      'Failed to update'
    );
    return serverError(error, 'update');
  }
});
