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

const VALID_STATUS = ['new', 'in-progress', 'completed', 'rejected'];

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/gdpr:read')) return forbidden('security/gdpr:read');
    const id = new URL(request.url).pathname.split('/').filter(Boolean).pop() as string;
    const dsar = await (prisma as any).dsarRequest.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!dsar) return notFound('DSAR request');
    let consentRecords: any[] = [];
    if (dsar.subjectId) {
      consentRecords = await (prisma as any).consentRecord.findMany({
        where: { tenantId: user.tenantId, subjectId: dsar.subjectId, isDeleted: false },
        orderBy: { category: 'asc' },
      });
    }
    return successItem({ ...dsar, consentRecords });
  } catch (error: any) {
    logger.error({ err: error, route: 'security/dsar/[id]/route.ts' }, 'Failed to get DSAR');
    return serverError(error, 'get');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/gdpr:update')) return forbidden('security/gdpr:update');
    const id = new URL(request.url).pathname.split('/').filter(Boolean).pop() as string;
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const existing = await (prisma as any).dsarRequest.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('DSAR request');
    const data: any = { updatedBy: user.userId };
    if (body.status !== undefined) {
      if (!VALID_STATUS.includes(String(body.status))) {
        return validationError({ message: 'Invalid status', field: 'status' });
      }
      data.status = String(body.status);
      if (data.status === 'completed') data.completedAt = new Date();
    }
    if (body.assignedTo !== undefined)
      data.assignedTo = body.assignedTo ? String(body.assignedTo) : null;
    if (body.priority !== undefined) data.priority = String(body.priority);
    const updated = await (prisma as any).dsarRequest.update({ where: { id }, data });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'security/dsar/[id]/route.ts' }, 'Failed to update DSAR');
    return serverError(error, 'update');
  }
});
