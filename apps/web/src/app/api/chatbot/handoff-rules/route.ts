import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const isActive = searchParams.get('isActive');
    const where: any = { tenantId, isDeleted: false };
    if (isActive !== null) where.isActive = isActive === 'true';
    const [rows, total] = await Promise.all([
      prisma.chatbotHandoffRule.findMany({
        where,
        orderBy: { priority: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chatbotHandoffRule.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list handoff rules');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body?.ruleName) return validationError({ message: 'ruleName is required' });
    const record = await prisma.chatbotHandoffRule.create({
      data: {
        tenantId,
        createdBy: userId,
        ruleName: body.ruleName,
        description: body.description ?? null,
        priority: body.priority ?? 0,
        isActive: body.isActive ?? true,
        triggers: body.triggers ?? [],
        conditions: body.conditions ?? [],
        action: body.action ?? null,
      },
    });
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create handoff rule');
  }
});
