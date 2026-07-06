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
    const contentType = searchParams.get('contentType');
    const defaultLanguage = searchParams.get('defaultLanguage');
    const where: any = { tenantId, isDeleted: false };
    if (contentType) where.contentType = contentType;
    if (defaultLanguage) where.defaultLanguage = defaultLanguage;
    const [rows, total] = await Promise.all([
      prisma.chatbotLanguageContent.findMany({ where, skip, take: limit }),
      prisma.chatbotLanguageContent.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list language content');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body?.contentType || !body?.referenceId)
      return validationError({ message: 'contentType and referenceId are required' });
    const existing = await prisma.chatbotLanguageContent.findFirst({
      where: {
        tenantId,
        contentType: body.contentType,
        referenceId: body.referenceId,
        isDeleted: false,
      },
    });
    if (existing)
      return validationError({
        message: 'Content record already exists for this type and reference',
      });
    const record = await prisma.chatbotLanguageContent.create({
      data: {
        tenantId,
        createdBy: userId,
        contentType: body.contentType,
        referenceId: body.referenceId,
        translations: body.translations ?? {},
        defaultLanguage: body.defaultLanguage ?? 'en',
      },
    });
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create language content');
  }
});
