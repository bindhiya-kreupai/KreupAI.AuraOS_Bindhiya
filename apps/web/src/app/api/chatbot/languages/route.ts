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
    const isEnabled = searchParams.get('isEnabled');
    const where: any = { tenantId, isDeleted: false };
    if (isEnabled !== null) where.isEnabled = isEnabled === 'true';
    const [rows, total] = await Promise.all([
      prisma.chatbotLanguage.findMany({ where, orderBy: { isDefault: 'desc' }, skip, take: limit }),
      prisma.chatbotLanguage.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    return serverError(error, 'list languages');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body?.languageCode || !body?.languageName)
      return validationError({ message: 'languageCode and languageName are required' });
    const existing = await prisma.chatbotLanguage.findFirst({
      where: { tenantId, languageCode: body.languageCode, isDeleted: false },
    });
    if (existing) return validationError({ message: 'Language already exists' });
    const record = await prisma.chatbotLanguage.create({
      data: {
        tenantId,
        createdBy: userId,
        languageCode: body.languageCode,
        languageName: body.languageName,
        isEnabled: body.isEnabled ?? false,
        isDefault: body.isDefault ?? false,
        translationModel: body.translationModel ?? null,
        confidenceThreshold: body.confidenceThreshold ?? 70,
        supportedFeatures: body.supportedFeatures ?? [],
      },
    });
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create language');
  }
});
