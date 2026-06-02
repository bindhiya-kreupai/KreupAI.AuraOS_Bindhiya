import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/ai-config:read')) return forbidden('admin/ai-config:read');
    let config = await prisma.aIConfig.findUnique({ where: { tenantId: user.tenantId } });
    if (!config) {
      config = await prisma.aIConfig.create({
        data: { tenantId: user.tenantId, updatedBy: user.userId },
      });
    }
    return successItem(config);
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to fetch AI config');
    return serverError(error, 'fetch AI config');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/ai-config:update')) return forbidden('admin/ai-config:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    delete body.id;
    delete body.tenantId;
    const updated = await prisma.aIConfig.upsert({
      where: { tenantId: user.tenantId },
      create: { tenantId: user.tenantId, ...body, updatedBy: user.userId },
      update: { ...body, updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to update AI config');
    return serverError(error, 'update AI config');
  }
});
