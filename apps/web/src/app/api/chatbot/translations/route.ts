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
    const sourceLanguage = searchParams.get('sourceLanguage');
    const targetLanguage = searchParams.get('targetLanguage');
    const where: any = { tenantId, isDeleted: false };
    if (sourceLanguage) where.sourceLanguage = sourceLanguage;
    if (targetLanguage) where.targetLanguage = targetLanguage;
    const [rows, total] = await Promise.all([
      prisma.chatbotTranslation.findMany({ where, skip, take: limit }),
      prisma.chatbotTranslation.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list translations');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body?.sourceLanguage || !body?.targetLanguage || !body?.sourceText)
      return validationError({
        message: 'sourceLanguage, targetLanguage, and sourceText are required',
      });
    const record = await prisma.chatbotTranslation.create({
      data: {
        tenantId,
        createdBy: userId,
        sourceLanguage: body.sourceLanguage,
        targetLanguage: body.targetLanguage,
        sourceText: body.sourceText,
        translatedText: body.translatedText ?? '',
        translationMethod: body.translationMethod ?? 'manual',
        quality: body.quality ?? null,
        translatedBy: body.translatedBy ?? null,
        translatedDate: body.translatedDate ? new Date(body.translatedDate) : new Date(),
        isApproved: body.isApproved ?? false,
      },
    });
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create translation');
  }
});
