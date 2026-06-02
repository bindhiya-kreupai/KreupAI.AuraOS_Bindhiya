import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  notFound,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('learning:write')) return forbidden('learning:write');
    const body = await safeJson(request);
    if (!body?.answers) return validationError({ message: 'answers required' });
    const assessment: any = await prisma.assessment.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!assessment) return notFound('Assessment');
    const submission = await prisma.assessmentSubmission.create({
      data: {
        tenantId: user.tenantId,
        assessmentId: params.id,
        employeeId: body.employeeId || user.userId,
        answers: body.answers as any,
        score: body.score,
        passed: body.passed ?? null,
        submittedAt: new Date(),
      } as any,
    });
    return successItem(submission, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'submit assessment');
  }
});
