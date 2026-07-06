import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement/surveys:read'))
      return forbidden('engagement/surveys:read');
    const url = new URL(request.url);
    const { page, limit, skip } = parsePagination(url.searchParams);
    const surveyId = url.searchParams.get('surveyId') || undefined;
    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (surveyId) where.surveyId = surveyId;
    const [rows, total] = await Promise.all([
      (prisma as any).engagementSurveyResponse.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).engagementSurveyResponse.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/survey-responses' }, 'Failed to list');
    return serverError(error, 'list');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement/surveys:read'))
      return forbidden('engagement/surveys:read');
    const body = await safeJson(request);
    if (!body || !body.surveyId) {
      return validationError({
        message: 'surveyId is required',
        messageAr: 'معرّف الاستطلاع مطلوب',
      });
    }
    const created = await (prisma as any).engagementSurveyResponse.create({
      data: {
        tenantId: user.tenantId,
        surveyId: String(body.surveyId),
        respondentId: user.userId,
        isAnonymous: Boolean(body.isAnonymous),
        answers: body.answers ?? {},
        sentiment: typeof body.sentiment === 'number' ? body.sentiment : null,
      },
    });
    // Increment the survey's response counter (best-effort).
    await (prisma as any).engagementSurvey
      .update({
        where: { id: String(body.surveyId) },
        data: { responses: { increment: 1 } },
      })
      .catch(() => undefined);
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/survey-responses' }, 'Failed to create');
    return serverError(error, 'create');
  }
});
