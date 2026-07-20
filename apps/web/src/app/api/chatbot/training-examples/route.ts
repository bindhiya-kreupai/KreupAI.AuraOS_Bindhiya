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
    const datasetId = searchParams.get('datasetId');
    const intent = searchParams.get('intent');
    const where: any = { tenantId, isDeleted: false };
    if (datasetId) where.datasetId = datasetId;
    if (intent) where.intent = intent;
    const [rows, total] = await Promise.all([
      prisma.chatbotTrainingExample.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chatbotTrainingExample.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list training examples');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body?.text || !body?.intent)
      return validationError({ message: 'text and intent are required' });
    const record = await prisma.chatbotTrainingExample.create({
      data: {
        tenantId,
        addedBy: userId,
        datasetId: body.datasetId ?? null,
        text: body.text,
        intent: body.intent,
        entities: body.entities ?? [],
        language: body.language ?? 'en',
        source: body.source ?? 'manual',
        isValidated: body.isValidated ?? false,
        validatedBy: body.validatedBy ?? null,
      },
    });
    if (body.datasetId) {
      await prisma.chatbotTrainingDataset.update({
        where: { id: body.datasetId },
        data: { totalExamples: { increment: 1 } },
      });
    }
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create training example');
  }
});
