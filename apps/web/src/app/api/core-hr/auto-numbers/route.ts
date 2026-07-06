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
    if (!permissions.includes('core-hr/auto-numbers:read'))
      return forbidden('core-hr/auto-numbers:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId };
    const [rows, total] = await Promise.all([
      (prisma as any).autoNumberSequence.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).autoNumberSequence.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'core-hr/auto-numbers/route.ts' }, 'Failed to list');
    return serverError(error, 'list');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('core-hr/auto-numbers:create'))
      return forbidden('core-hr/auto-numbers:create');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const created = await (prisma as any).autoNumberSequence.create({
      data: {
        ...body,
        tenantId: user.tenantId,
        createdBy: user.userId,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'core-hr/auto-numbers/route.ts' }, 'Failed to create');
    return serverError(error, 'create');
  }
});

const ALLOWED_UPDATE_FIELDS = [
  'prefix',
  'suffix',
  'padLength',
  'currentNumber',
  'incrementBy',
  'resetFrequency',
  'isActive',
  'description',
] as const;

// PUT upserts a sequence by entityType so tenant-wide edits persist server-side
// (the config screen edits per-entity prefix / pad length / next number).
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('core-hr/auto-numbers:update'))
      return forbidden('core-hr/auto-numbers:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });

    const entityType = String(body.entityType || '').trim();
    if (!entityType) {
      return validationError({
        message: 'entityType is required',
        messageAr: 'نوع الكيان مطلوب',
      });
    }

    const data: Record<string, any> = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const saved = await (prisma as any).autoNumberSequence.upsert({
      where: { tenantId_entityType: { tenantId: user.tenantId, entityType } },
      update: { ...data, updatedBy: user.userId },
      create: {
        tenantId: user.tenantId,
        entityType,
        prefix: data.prefix ?? 'SEQ',
        suffix: data.suffix,
        padLength: data.padLength ?? 4,
        currentNumber: data.currentNumber ?? 0,
        incrementBy: data.incrementBy ?? 1,
        resetFrequency: data.resetFrequency ?? 'never',
        isActive: data.isActive ?? true,
        description: data.description,
        createdBy: user.userId,
      },
    });
    return successItem(saved, { status: 200 });
  } catch (error: any) {
    logger.error({ err: error, route: 'core-hr/auto-numbers/route.ts' }, 'Failed to update');
    return serverError(error, 'update');
  }
});
