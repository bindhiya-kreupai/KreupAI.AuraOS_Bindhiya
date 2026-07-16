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
    const language = searchParams.get('language');
    const status = searchParams.get('status');
    const where: any = { tenantId, isDeleted: false };
    if (language) where.language = language;
    if (status) where.status = status;
    const [rows, total] = await Promise.all([
      prisma.chatbotTrainingDataset.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chatbotTrainingDataset.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list training datasets');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body?.datasetName) return validationError({ message: 'datasetName is required' });
    const record = await prisma.chatbotTrainingDataset.create({
      data: {
        tenantId,
        createdBy: userId,
        datasetName: body.datasetName,
        description: body.description ?? null,
        language: body.language ?? 'en',
        totalExamples: body.totalExamples ?? 0,
        intents: body.intents ?? [],
        entities: body.entities ?? [],
        status: body.status ?? 'draft',
      },
    });
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create training dataset');
  }
});
