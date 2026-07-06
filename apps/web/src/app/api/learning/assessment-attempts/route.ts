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
    const assessmentId = searchParams.get('assessmentId');
    const learnerId = searchParams.get('learnerId');

    // Scope by tenant via the parent assessment relation.
    const where: Record<string, unknown> = {
      assessment: { tenantId: user.tenantId },
      isDeleted: false,
    };
    if (assessmentId) where.assessmentId = assessmentId;
    if (learnerId) where.employeeId = learnerId;

    const attempts = await prisma.assessmentSubmission.findMany({
      where,
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: attempts });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error fetching assessment attempts');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch assessment attempts',
        messageAr: 'فشل في جلب محاولات التقييم',
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
    if (!body.assessmentId) {
      return NextResponse.json(
        { success: false, message: 'Assessment ID is required', messageAr: 'معرف التقييم مطلوب' },
        { status: 400 }
      );
    }

    // Verify the assessment belongs to the caller's tenant before recording.
    const assessment = await prisma.assessment.findFirst({
      where: { id: body.assessmentId, tenantId: user.tenantId },
    });
    if (!assessment) {
      return NextResponse.json(
        { success: false, message: 'Assessment not found', messageAr: 'التقييم غير موجود' },
        { status: 404 }
      );
    }

    const employeeId = body.learnerId || user.userId;
    const priorAttempts = await prisma.assessmentSubmission.count({
      where: { assessmentId: body.assessmentId, employeeId },
    });

    const score = body.score != null ? Number(body.score) : null;
    const passed = score != null ? score >= assessment.passingScore : null;

    const submission = await prisma.assessmentSubmission.create({
      data: {
        assessmentId: body.assessmentId,
        employeeId,
        answers: body.answers ?? {},
        score,
        passed,
        attemptNumber: priorAttempts + 1,
        submittedAt: new Date(),
        createdBy: user.userId,
      },
    });

    logger.info({ id: submission.id }, 'Assessment attempt recorded');
    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error submitting assessment attempt');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit assessment attempt',
        messageAr: 'فشل في إرسال محاولة التقييم',
      },
      { status: 500 }
    );
  }
});
