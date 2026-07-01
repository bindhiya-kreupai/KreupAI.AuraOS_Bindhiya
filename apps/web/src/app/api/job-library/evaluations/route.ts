import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Job Evaluation API — systematic scoring / grading of job roles.
 * Tenant-scoped. Backed by the JobEvaluation model (accessed via prisma-as-any
 * because it is a new module table merged outside the base schema).
 */

const db = prisma as any;

const PENDING_STATUSES = ['pending', 'information_requested', 'in_progress'];

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status')?.trim();

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;

    const evaluations = await db.jobEvaluation.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    });

    const pending = evaluations.filter((e: any) => PENDING_STATUSES.includes(e.status));
    const completed = evaluations.filter((e: any) => e.status === 'completed');

    // Grade distribution derived from completed evaluations.
    const distribution: Record<string, number> = {};
    for (const e of completed) {
      const grade = e.assignedGrade || 'Ungraded';
      distribution[grade] = (distribution[grade] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        pending,
        completed,
        distribution: Object.entries(distribution)
          .map(([grade, count]) => ({ grade, count }))
          .sort((a, b) => a.grade.localeCompare(b.grade)),
        total: evaluations.length,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching job evaluations');
    return NextResponse.json(
      {
        error: 'Failed to fetch job evaluations',
        message: 'Failed to fetch job evaluations',
        messageAr: 'فشل في جلب تقييمات الوظائف',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { jobTitle, familyName, method, jobProfileId } = body ?? {};

    if (!jobTitle) {
      return NextResponse.json(
        {
          error: 'jobTitle is required',
          message: 'jobTitle is required',
          messageAr: 'عنوان الوظيفة مطلوب',
        },
        { status: 400 }
      );
    }

    const evaluation = await db.jobEvaluation.create({
      data: {
        tenantId: user.tenantId,
        jobTitle,
        familyName: familyName || null,
        method: method || 'point_factor',
        jobProfileId: jobProfileId || null,
        status: 'pending',
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });
    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    logger.error({ error }, 'Error creating job evaluation');
    return NextResponse.json(
      {
        error: 'Failed to create job evaluation',
        message: 'Failed to create job evaluation',
        messageAr: 'فشل في إنشاء تقييم الوظيفة',
      },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, action, score, assignedGrade, notes, factors } = body ?? {};

    if (!id) {
      return NextResponse.json(
        { error: 'id is required', message: 'id is required', messageAr: 'المعرف مطلوب' },
        { status: 400 }
      );
    }

    const existing = await db.jobEvaluation.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        {
          error: 'Evaluation not found',
          message: 'Evaluation not found',
          messageAr: 'التقييم غير موجود',
        },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = { updatedBy: user.userId };

    if (action === 'start') {
      data.status = 'in_progress';
      data.evaluatorId = user.userId;
      data.evaluatorName = user.email ?? null;
    } else if (action === 'complete') {
      if (score === undefined || score === null || !assignedGrade) {
        return NextResponse.json(
          {
            error: 'score and assignedGrade are required to complete an evaluation',
            message: 'score and assignedGrade are required to complete an evaluation',
            messageAr: 'الدرجة والرتبة المخصصة مطلوبة لإكمال التقييم',
          },
          { status: 400 }
        );
      }
      data.status = 'completed';
      data.score = Number(score);
      data.assignedGrade = assignedGrade;
      data.completedAt = new Date();
      data.evaluatorId = existing.evaluatorId || user.userId;
      data.evaluatorName = existing.evaluatorName || user.email || null;
      if (factors !== undefined) data.factors = factors;
      if (notes !== undefined) data.notes = notes;
    } else {
      if (score !== undefined) data.score = score === null ? null : Number(score);
      if (assignedGrade !== undefined) data.assignedGrade = assignedGrade;
      if (notes !== undefined) data.notes = notes;
      if (factors !== undefined) data.factors = factors;
    }

    // tenant-ok: id-based op preceded by tenant-scoped findFirst above
    const updated = await db.jobEvaluation.update({ where: { id: existing.id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error({ error }, 'Error updating job evaluation');
    return NextResponse.json(
      {
        error: 'Failed to update job evaluation',
        message: 'Failed to update job evaluation',
        messageAr: 'فشل في تحديث تقييم الوظيفة',
      },
      { status: 500 }
    );
  }
});
