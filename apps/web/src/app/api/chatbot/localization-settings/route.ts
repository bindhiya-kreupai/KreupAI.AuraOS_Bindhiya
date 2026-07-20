import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { safeJson, serverError, successItem, validationError } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId } = context.user;
    let settings = await prisma.chatbotLocalizationSettings.findFirst({
      where: { tenantId, isDeleted: false },
    });
    if (!settings) {
      settings = await prisma.chatbotLocalizationSettings.create({
        data: { tenantId },
      });
    }
    return successItem(settings);
  } catch (error: any) {
    return serverError(error, 'get localization settings');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    let settings = await prisma.chatbotLocalizationSettings.findFirst({
      where: { tenantId, isDeleted: false },
    });
    if (!settings) {
      settings = await prisma.chatbotLocalizationSettings.create({
        data: { tenantId },
      });
    }
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Request body required' });
    const record = await prisma.chatbotLocalizationSettings.update({
      where: { id: settings.id },
      data: {
        ...(body.autoDetectLanguage !== undefined && {
          autoDetectLanguage: body.autoDetectLanguage,
        }),
        ...(body.fallbackLanguage !== undefined && { fallbackLanguage: body.fallbackLanguage }),
        ...(body.supportedLanguages !== undefined && {
          supportedLanguages: body.supportedLanguages,
        }),
        ...(body.translationProvider !== undefined && {
          translationProvider: body.translationProvider,
        }),
        ...(body.translationApiKey !== undefined && { translationApiKey: body.translationApiKey }),
        ...(body.enableAutoTranslation !== undefined && {
          enableAutoTranslation: body.enableAutoTranslation,
        }),
        ...(body.requireApprovalForAutoTranslation !== undefined && {
          requireApprovalForAutoTranslation: body.requireApprovalForAutoTranslation,
        }),
        lastUpdatedAt: new Date(),
        lastUpdatedBy: userId,
        updatedBy: userId,
      },
    });
    return successItem(record);
  } catch (error: any) {
    return serverError(error, 'update localization settings');
  }
});
