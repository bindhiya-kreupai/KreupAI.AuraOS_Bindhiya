import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { DEI_ERRORS } from '../_shared';

const db = prisma as any;

const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

/**
 * GET /api/dei/training — list bias-training modules mapped to the UI shape
 * (title, thumb, status, duration, progress) for the authenticated employee.
 * POST /api/dei/training — create a training module (admin).
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context) => {
  try {
    const { user, employeeId } = context;

    const trainings = await db.deiBiasTraining.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'asc' },
    });

    const enrollments = employeeId
      ? await db.deiTrainingEnrollment.findMany({
          where: { tenantId: user.tenantId, employeeId },
        })
      : [];
    const byTraining = new Map<string, { status: string; progress: number }>(
      enrollments.map((e: { trainingId: string; status: string; progress: number }) => [
        e.trainingId,
        { status: e.status, progress: e.progress },
      ])
    );

    const items = trainings.map(
      (t: {
        id: string;
        title: string;
        durationMins: number;
        thumbClass: string | null;
        category: string;
        isMandatory: boolean;
      }) => {
        const enr = byTraining.get(t.id);
        const status = enr?.status || 'not_started';
        return {
          id: t.id,
          title: t.title,
          duration: `${t.durationMins} min`,
          thumb: t.thumbClass || 'bg-slate-100 dark:bg-slate-800',
          category: t.category,
          isMandatory: t.isMandatory,
          status: STATUS_LABEL[status] || 'Not Started',
          progress: enr?.progress ?? 0,
        };
      }
    );

    return NextResponse.json({
      items,
      total: items.length,
      page: 1,
      pageSize: items.length,
      hasNextPage: false,
    });
  } catch (error) {
    console.error('DEI training GET error:', error);
    return DEI_ERRORS.server();
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json().catch(() => ({}));
    if (!body.title || typeof body.title !== 'string') {
      return DEI_ERRORS.badRequest('Training title is required', 'عنوان التدريب مطلوب');
    }
    const training = await db.deiBiasTraining.create({
      data: {
        tenantId: user.tenantId,
        title: body.title,
        titleAr: body.titleAr ?? null,
        description: body.description ?? null,
        category: body.category || 'unconscious_bias',
        durationMins: Number.isFinite(Number(body.durationMins)) ? Number(body.durationMins) : 30,
        isMandatory: body.isMandatory ?? false,
        thumbClass: body.thumbClass ?? null,
        status: 'published',
        createdBy: user.userId,
      },
    });
    return NextResponse.json(
      { success: true, data: training, message: 'Training created', messageAr: 'تم إنشاء التدريب' },
      { status: 201 }
    );
  } catch (error) {
    console.error('DEI training POST error:', error);
    return DEI_ERRORS.server();
  }
});
