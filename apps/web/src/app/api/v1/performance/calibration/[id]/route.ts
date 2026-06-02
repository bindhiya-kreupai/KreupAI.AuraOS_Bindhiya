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
    if (!permissions.includes('performance/calibration:read'))
      return forbidden('performance/calibration:read');
    const row = await prisma.calibrationSession.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!row) return notFound('Calibration session');
    return successItem(row);
  } catch (error: any) {
    return serverError(error, 'fetch calibration');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('performance/calibration:update'))
      return forbidden('performance/calibration:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    delete body.id;
    delete body.tenantId;
    const result = await prisma.calibrationSession.updateMany({
      where: { id: params.id, tenantId: user.tenantId },
      data: body,
    });
    if (result.count === 0) return notFound('Calibration session');
    const updated = await prisma.calibrationSession.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    return successItem(updated);
  } catch (error: any) {
    return serverError(error, 'update calibration');
  }
});
