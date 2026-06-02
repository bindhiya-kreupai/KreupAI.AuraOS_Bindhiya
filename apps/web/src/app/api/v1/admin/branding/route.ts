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
    if (!permissions.includes('admin/branding:read')) return forbidden('admin/branding:read');
    let branding = await prisma.tenantBranding.findUnique({ where: { tenantId: user.tenantId } });
    if (!branding) {
      branding = await prisma.tenantBranding.create({
        data: { tenantId: user.tenantId, updatedBy: user.userId },
      });
    }
    return successItem(branding);
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to fetch branding');
    return serverError(error, 'fetch branding');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/branding:update')) return forbidden('admin/branding:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    delete body.id;
    delete body.tenantId;
    const updated = await prisma.tenantBranding.upsert({
      where: { tenantId: user.tenantId },
      create: { tenantId: user.tenantId, ...body, updatedBy: user.userId },
      update: { ...body, updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to update branding');
    return serverError(error, 'update branding');
  }
});
