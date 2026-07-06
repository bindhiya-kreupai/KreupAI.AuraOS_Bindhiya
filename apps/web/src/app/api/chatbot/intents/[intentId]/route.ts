import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  safeJson,
  serverError,
  successItem,
  notFound,
  validationError,
} from '@/lib/api/crud-helpers';

async function getIntent(tenantId: string, intentId: string) {
  return prisma.chatbotIntent.findFirst({
    where: { id: intentId, tenantId, isDeleted: false },
  });
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const record = await getIntent(tenantId, context.params.intentId);
    if (!record) return notFound('Intent');
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'get intent');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const intentId = context.params.intentId;
    const existing = await getIntent(tenantId, intentId);
    if (!existing) return notFound('Intent');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Request body required' });
    const record = await prisma.chatbotIntent.update({
      where: { id: intentId },
      data: {
        ...(body.intentName !== undefined && { intentName: body.intentName }),
        ...(body.displayName !== undefined && { displayName: body.displayName }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.trainingPhrases !== undefined && { trainingPhrases: body.trainingPhrases }),
        ...(body.responses !== undefined && { responses: body.responses }),
        ...(body.parameters !== undefined && { parameters: body.parameters }),
        ...(body.contexts !== undefined && { contexts: body.contexts }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.webhookEnabled !== undefined && { webhookEnabled: body.webhookEnabled }),
        ...(body.webhookUrl !== undefined && { webhookUrl: body.webhookUrl }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.confidenceThreshold !== undefined && {
          confidenceThreshold: body.confidenceThreshold,
        }),
        ...(body.usageCount !== undefined && { usageCount: body.usageCount }),
        ...(body.averageConfidence !== undefined && { averageConfidence: body.averageConfidence }),
        updatedBy: userId,
      },
    });
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'update intent');
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const intentId = context.params.intentId;
    const existing = await getIntent(tenantId, intentId);
    if (!existing) return notFound('Intent');
    await prisma.chatbotIntent.update({
      where: { id: intentId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });
    return successItem({ deleted: true });
  } catch (error: any) {
    return serverError(error, 'delete intent');
  }
});
