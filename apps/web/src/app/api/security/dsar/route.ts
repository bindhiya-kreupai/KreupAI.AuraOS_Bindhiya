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

const VALID_TYPES = ['access', 'erasure', 'rectification', 'portability', 'restriction'];

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/gdpr:read')) return forbidden('security/gdpr:read');
    const searchParams = new URL(request.url).searchParams;
    const { page, limit, skip } = parsePagination(searchParams);
    const status = searchParams.get('status');
    const where: any = { tenantId: user.tenantId, isDeleted: false };
    if (status) where.status = status;
    const [rows, total] = await Promise.all([
      (prisma as any).dsarRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).dsarRequest.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'security/dsar/route.ts' }, 'Failed to list DSARs');
    return serverError(error, 'list');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/gdpr:create')) return forbidden('security/gdpr:create');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const requestType = String(body.requestType || '').trim();
    const subjectName = String(body.subjectName || '').trim();
    const subjectEmail = String(body.subjectEmail || '').trim();
    if (!VALID_TYPES.includes(requestType)) {
      return validationError({ message: 'Invalid or missing requestType', field: 'requestType' });
    }
    if (!subjectName)
      return validationError({ message: 'subjectName is required', field: 'subjectName' });
    if (!subjectEmail)
      return validationError({ message: 'subjectEmail is required', field: 'subjectEmail' });
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const created = await (prisma as any).dsarRequest.create({
      data: {
        tenantId: user.tenantId,
        requestType,
        subjectName,
        subjectEmail,
        subjectId: body.subjectId ? String(body.subjectId) : null,
        details: body.details ? String(body.details) : null,
        priority: body.priority ? String(body.priority) : 'medium',
        status: 'new',
        dueDate,
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'security/dsar/route.ts' }, 'Failed to create DSAR');
    return serverError(error, 'create');
  }
});
