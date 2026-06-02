import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
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
    if (!permissions.includes('compliance:labor:read')) return forbidden('compliance:labor:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId };
    const [rows, total] = await Promise.all([
      prisma.predictiveSchedulingRule.findMany({
        where,
        orderBy: { effectiveFrom: 'desc' },
        skip,
        take: limit,
      }),
      prisma.predictiveSchedulingRule.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list predictive scheduling rules');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('compliance:labor:write')) return forbidden('compliance:labor:write');
    const body = await safeJson(request);
    if (!body?.jurisdiction) return validationError({ message: 'jurisdiction required' });
    const created = await prisma.predictiveSchedulingRule.upsert({
      where: {
        tenantId_jurisdiction: { tenantId: user.tenantId, jurisdiction: body.jurisdiction },
      } as any,
      create: {
        tenantId: user.tenantId,
        jurisdiction: body.jurisdiction,
        advanceNoticeDays: body.advanceNoticeDays || 14,
        predictabilityPayPercent: body.predictabilityPayPercent || 0,
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : new Date(),
        isActive: body.isActive ?? true,
      },
      update: {
        advanceNoticeDays: body.advanceNoticeDays,
        predictabilityPayPercent: body.predictabilityPayPercent,
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
        isActive: body.isActive,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'upsert predictive scheduling rule');
  }
});
