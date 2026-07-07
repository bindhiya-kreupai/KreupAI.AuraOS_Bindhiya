import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { DEI_ERRORS } from '../../../_shared';

const db = prisma as any;

/**
 * POST /api/dei/training/:id/enroll — enroll the authenticated employee and/or
 * update their progress. Body: { progress?: number }. employeeId comes from auth.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, employeeId, params } = context;
    const trainingId = params?.id as string | undefined;
    if (!trainingId) return DEI_ERRORS.badRequest();
    if (!employeeId) {
      return DEI_ERRORS.badRequest(
        'No employee profile linked to this user',
        'لا يوجد ملف موظف مرتبط'
      );
    }

    const training = await db.deiBiasTraining.findFirst({
      where: { id: trainingId, tenantId: user.tenantId },
    });
    if (!training) return DEI_ERRORS.notFound('Training');

    const body = await request.json().catch(() => ({}));
    const rawProgress = Number(body.progress);
    const progress = Number.isFinite(rawProgress) ? Math.min(100, Math.max(0, rawProgress)) : 0;
    const status = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';

    const existing = await db.deiTrainingEnrollment.findFirst({
      where: { tenantId: user.tenantId, trainingId, employeeId },
    });

    const enrollment = existing
      ? await db.deiTrainingEnrollment.update({
          where: { id: existing.id },
          data: {
            progress,
            status,
            completedAt: status === 'completed' ? new Date() : null,
          },
        })
      : await db.deiTrainingEnrollment.create({
          data: {
            tenantId: user.tenantId,
            trainingId,
            employeeId,
            progress,
            status,
            completedAt: status === 'completed' ? new Date() : null,
          },
        });

    return NextResponse.json({
      success: true,
      data: enrollment,
      message: 'Enrollment updated',
      messageAr: 'تم تحديث التسجيل',
    });
  } catch (error) {
    console.error('DEI training enroll error:', error);
    return DEI_ERRORS.server();
  }
});
