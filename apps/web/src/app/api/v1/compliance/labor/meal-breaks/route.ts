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
      prisma.laborMealBreakRule.findMany({
        where,
        orderBy: { effectiveFrom: 'desc' },
        skip,
        take: limit,
      }),
      prisma.laborMealBreakRule.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list meal break rules');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('compliance:labor:write')) return forbidden('compliance:labor:write');
    const body = await safeJson(request);
    if (!body?.countryCode) return validationError({ message: 'countryCode required' });
    const created = await prisma.laborMealBreakRule.upsert({
      where: {
        tenantId_countryCode: { tenantId: user.tenantId, countryCode: body.countryCode },
      } as any,
      create: {
        tenantId: user.tenantId,
        countryCode: body.countryCode,
        minHoursWorked: body.minHoursWorked || 5,
        mealBreakMins: body.mealBreakMins || 30,
        paidBreak: !!body.paidBreak,
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : new Date(),
      },
      update: {
        minHoursWorked: body.minHoursWorked,
        mealBreakMins: body.mealBreakMins,
        paidBreak: body.paidBreak,
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'upsert meal break rule');
  }
});
