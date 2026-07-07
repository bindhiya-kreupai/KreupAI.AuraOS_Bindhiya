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
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const where: any = { tenantId, isDeleted: false };
    if (category) where.category = category;
    if (isActive !== null) where.isActive = isActive === 'true';
    const [rows, total] = await Promise.all([
      prisma.chatbotIntent.findMany({ where, orderBy: { updatedAt: 'desc' }, skip, take: limit }),
      prisma.chatbotIntent.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list intents');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body?.intentName) return validationError({ message: 'intentName is required' });
    const record = await prisma.chatbotIntent.create({
      data: {
        tenantId,
        createdBy: userId,
        intentName: body.intentName,
        displayName: body.displayName ?? null,
        description: body.description ?? null,
        category: body.category ?? null,
        trainingPhrases: body.trainingPhrases ?? [],
        responses: body.responses ?? [],
        parameters: body.parameters ?? [],
        contexts: body.contexts ?? [],
        priority: body.priority ?? 0,
        webhookEnabled: body.webhookEnabled ?? false,
        webhookUrl: body.webhookUrl ?? null,
        isActive: body.isActive ?? true,
        confidenceThreshold: body.confidenceThreshold ?? 0.7,
      },
    });
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create intent');
  }
});
