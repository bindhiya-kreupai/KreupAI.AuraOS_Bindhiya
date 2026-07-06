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

async function getDataset(tenantId: string, datasetId: string) {
  return prisma.chatbotTrainingDataset.findFirst({
    where: { id: datasetId, tenantId, isDeleted: false },
  });
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const record = await getDataset(tenantId, context.params.datasetId);
    if (!record) return notFound('TrainingDataset');
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'get training dataset');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const datasetId = context.params.datasetId;
    const existing = await getDataset(tenantId, datasetId);
    if (!existing) return notFound('TrainingDataset');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Request body required' });
    const record = await prisma.chatbotTrainingDataset.update({
      where: { id: datasetId },
      data: {
        ...(body.datasetName !== undefined && { datasetName: body.datasetName }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.language !== undefined && { language: body.language }),
        ...(body.totalExamples !== undefined && { totalExamples: body.totalExamples }),
        ...(body.intents !== undefined && { intents: body.intents }),
        ...(body.entities !== undefined && { entities: body.entities }),
        ...(body.status !== undefined && { status: body.status }),
        updatedBy: userId,
      },
    });
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'update training dataset');
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const datasetId = context.params.datasetId;
    const existing = await getDataset(tenantId, datasetId);
    if (!existing) return notFound('TrainingDataset');
    await prisma.chatbotTrainingDataset.update({
      where: { id: datasetId },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });
    return successItem({ deleted: true });
  } catch (error: any) {
    return serverError(error, 'delete training dataset');
  }
});
