import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { DEI_ERRORS } from '../_shared';

const db = prisma as any;

/**
 * GET /api/dei/surveys — list tenant inclusion surveys.
 * POST /api/dei/surveys — launch a new survey.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50', 10)));

    const [items, total] = await Promise.all([
      db.deiSurvey.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.deiSurvey.count({ where: { tenantId: user.tenantId } }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      hasNextPage: page * pageSize < total,
    });
  } catch (error) {
    console.error('DEI surveys GET error:', error);
    return DEI_ERRORS.server();
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json().catch(() => ({}));
    if (!body.title || typeof body.title !== 'string') {
      return DEI_ERRORS.badRequest('Survey title is required', 'عنوان الاستطلاع مطلوب');
    }

    const survey = await db.deiSurvey.create({
      data: {
        tenantId: user.tenantId,
        title: body.title,
        titleAr: body.titleAr ?? null,
        description: body.description ?? null,
        surveyType: body.surveyType || 'pulse_check',
        status: body.status === 'draft' ? 'draft' : 'active',
        isAnonymous: body.isAnonymous ?? true,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        targetCount: typeof body.targetCount === 'number' ? body.targetCount : 0,
        questions: body.questions ?? null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json(
      { success: true, data: survey, message: 'Survey launched', messageAr: 'تم إطلاق الاستطلاع' },
      { status: 201 }
    );
  } catch (error) {
    console.error('DEI surveys POST error:', error);
    return DEI_ERRORS.server();
  }
});
