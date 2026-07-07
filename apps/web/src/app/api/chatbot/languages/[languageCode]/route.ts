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

async function getLanguage(tenantId: string, languageCode: string) {
  return prisma.chatbotLanguage.findFirst({
    where: { tenantId, languageCode, isDeleted: false },
  });
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    const record = await getLanguage(tenantId, context.params.languageCode);
    if (!record) return notFound('Language');
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'get language');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const languageCode = context.params.languageCode;
    const existing = await getLanguage(tenantId, languageCode);
    if (!existing) return notFound('Language');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Request body required' });
    if (body.action === 'enable') {
      const record = await prisma.chatbotLanguage.update({
        where: { id: existing.id },
        data: { isEnabled: true, updatedBy: userId },
      });
      return successItem(record);
    }
    const record = await prisma.chatbotLanguage.update({
      where: { id: existing.id },
      data: {
        ...(body.languageName !== undefined && { languageName: body.languageName }),
        ...(body.isEnabled !== undefined && { isEnabled: body.isEnabled }),
        ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
        ...(body.translationModel !== undefined && { translationModel: body.translationModel }),
        ...(body.confidenceThreshold !== undefined && {
          confidenceThreshold: body.confidenceThreshold,
        }),
        ...(body.supportedFeatures !== undefined && { supportedFeatures: body.supportedFeatures }),
        updatedBy: userId,
      },
    });
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'update language');
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const languageCode = context.params.languageCode;
    const existing = await getLanguage(tenantId, languageCode);
    if (!existing) return notFound('Language');
    await prisma.chatbotLanguage.update({
      where: { id: existing.id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });
    return successItem({ deleted: true });
  } catch (error: any) {
    return serverError(error, 'delete language');
  }
});
