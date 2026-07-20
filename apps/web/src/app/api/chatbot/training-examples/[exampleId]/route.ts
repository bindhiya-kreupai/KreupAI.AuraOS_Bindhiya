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

async function getExample(tenantId: string, exampleId: string) {
  return prisma.chatbotTrainingExample.findFirst({
    where: { id: exampleId, tenantId, isDeleted: false },
  });
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const record = await getExample(tenantId, context.params.exampleId);
    if (!record) return notFound('TrainingExample');
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'get training example');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const exampleId = context.params.exampleId;
    const existing = await getExample(tenantId, exampleId);
    if (!existing) return notFound('TrainingExample');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Request body required' });
    const record = await prisma.chatbotTrainingExample.update({
      where: { id: exampleId },
      data: {
        ...(body.text !== undefined && { text: body.text }),
        ...(body.intent !== undefined && { intent: body.intent }),
        ...(body.entities !== undefined && { entities: body.entities }),
        ...(body.language !== undefined && { language: body.language }),
        ...(body.source !== undefined && { source: body.source }),
        ...(body.isValidated !== undefined && { isValidated: body.isValidated }),
        ...(body.validatedBy !== undefined && { validatedBy: body.validatedBy }),
      },
    });
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'update training example');
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const exampleId = context.params.exampleId;
    const existing = await getExample(tenantId, exampleId);
    if (!existing) return notFound('TrainingExample');
    await prisma.chatbotTrainingExample.update({
      where: { id: exampleId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    if (existing.datasetId) {
      await prisma.chatbotTrainingDataset.update({
        where: { id: existing.datasetId },
        data: { totalExamples: { decrement: 1 } },
      });
    }
    return successItem({ deleted: true });
  } catch (error: any) {
    return serverError(error, 'delete training example');
  }
});
