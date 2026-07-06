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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const where: any = { tenantId, isDeleted: false };
    if (status) where.status = status;
    if (category) where.category = category;
    const [rows, total] = await Promise.all([
      prisma.chatbotDialogueFlow.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chatbotDialogueFlow.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list dialogue flows');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body?.flowName) return validationError({ message: 'flowName is required' });
    const record = await prisma.chatbotDialogueFlow.create({
      data: {
        tenantId,
        createdBy: userId,
        flowName: body.flowName,
        description: body.description ?? null,
        category: body.category ?? null,
        nodes: body.nodes ?? [],
        connections: body.connections ?? [],
        variables: body.variables ?? null,
        isActive: body.isActive ?? false,
        version: body.version ?? '1.0',
        status: body.status ?? 'draft',
        triggerIntents: body.triggerIntents ?? null,
        tags: body.tags ?? null,
      },
    });
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create dialogue flow');
  }
});
