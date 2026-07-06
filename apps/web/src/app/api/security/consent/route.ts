import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/gdpr:read')) return forbidden('security/gdpr:read');
    const searchParams = new URL(request.url).searchParams;
    const { page, limit, skip } = parsePagination(searchParams);
    const subjectId = searchParams.get('subjectId');
    const where: any = { tenantId: user.tenantId, isDeleted: false };
    if (subjectId) where.subjectId = subjectId;
    const [rows, total] = await Promise.all([
      (prisma as any).consentRecord.findMany({
        where,
        orderBy: { category: 'asc' },
        skip,
        take: limit,
      }),
      (prisma as any).consentRecord.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'security/consent/route.ts' }, 'Failed to list consent');
    return serverError(error, 'list');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/gdpr:update')) return forbidden('security/gdpr:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const subjectId = String(body.subjectId || '').trim();
    const category = String(body.category || '').trim();
    if (!subjectId)
      return validationError({ message: 'subjectId is required', field: 'subjectId' });
    if (!category) return validationError({ message: 'category is required', field: 'category' });
    const granted = Boolean(body.granted);
    const now = new Date();
    const record = await (prisma as any).consentRecord.upsert({
      where: {
        tenantId_subjectId_category: { tenantId: user.tenantId, subjectId, category },
      },
      create: {
        tenantId: user.tenantId,
        subjectId,
        category,
        granted,
        source: body.source ? String(body.source) : 'consent-manager',
        grantedAt: granted ? now : null,
        revokedAt: granted ? null : now,
        createdBy: user.userId,
        updatedBy: user.userId,
      },
      update: {
        granted,
        grantedAt: granted ? now : null,
        revokedAt: granted ? null : now,
        updatedBy: user.userId,
      },
    });
    return successItem(record);
  } catch (error: any) {
    logger.error({ err: error, route: 'security/consent/route.ts' }, 'Failed to upsert consent');
    return serverError(error, 'update');
  }
});
