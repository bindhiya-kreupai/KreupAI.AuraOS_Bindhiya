import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEARNING, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const learnerId = searchParams.get('learnerId');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (courseId) where.courseId = courseId;
    if (learnerId) where.learnerId = learnerId;

    const feedback = await prisma.trainingFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: feedback });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error fetching training feedback');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch training feedback',
        messageAr: 'فشل في جلب ملاحظات التدريب',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEARNING, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const rating = Number(body.rating);
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: 'A rating between 1 and 5 is required',
          messageAr: 'مطلوب تقييم بين 1 و 5',
        },
        { status: 400 }
      );
    }

    const feedback = await prisma.trainingFeedback.create({
      data: {
        tenantId: user.tenantId,
        courseId: body.courseId ?? null,
        sessionId: body.sessionId ?? null,
        learnerId: body.learnerId || user.userId,
        rating,
        comments: body.comments ?? null,
        wouldRecommend: typeof body.wouldRecommend === 'boolean' ? body.wouldRecommend : null,
        createdBy: user.userId,
      },
    });

    logger.info({ id: feedback.id }, 'Training feedback created');
    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error creating training feedback');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit training feedback',
        messageAr: 'فشل في إرسال ملاحظات التدريب',
      },
      { status: 500 }
    );
  }
});
