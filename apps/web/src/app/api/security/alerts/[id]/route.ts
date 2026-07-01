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

const UPDATABLE = [
  'severity',
  'category',
  'source',
  'description',
  'affectedUser',
  'status',
  'resolution',
  'resolvedBy',
] as const;

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/alerts:update')) return forbidden('security/alerts:update');
    const id = new URL(request.url).pathname.split('/').filter(Boolean).pop() as string;
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });

    const existing = await (prisma as any).securityAlert.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Security alert');

    const data: any = { updatedBy: user.userId };
    for (const key of UPDATABLE) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.status === 'RESOLVED' && !existing.resolvedAt) {
      data.resolvedAt = new Date();
      data.resolvedBy = body.resolvedBy ?? user.userId;
    }

    const updated = await (prisma as any).securityAlert.update({ where: { id }, data });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'security/alerts/[id]/route.ts' }, 'Failed to update');
    return serverError(error, 'update alert');
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/alerts:delete')) return forbidden('security/alerts:delete');
    const id = new URL(request.url).pathname.split('/').filter(Boolean).pop() as string;

    const existing = await (prisma as any).securityAlert.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Security alert');

    await (prisma as any).securityAlert.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId },
    });
    return successItem({ id, deleted: true });
  } catch (error: any) {
    logger.error({ err: error, route: 'security/alerts/[id]/route.ts' }, 'Failed to delete');
    return serverError(error, 'delete alert');
  }
});
