import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { DEI_ERRORS } from '../_shared';

const db = prisma as any;

/**
 * GET /api/dei/goals — list DEI goals/OKRs.
 * POST /api/dei/goals — create a new goal.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context) => {
  try {
    const { user } = context;
    const items = await db.deiGoal.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({
      items,
      total: items.length,
      page: 1,
      pageSize: items.length,
      hasNextPage: false,
    });
  } catch (error) {
    console.error('DEI goals GET error:', error);
    return DEI_ERRORS.server();
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json().catch(() => ({}));
    if (!body.title || typeof body.title !== 'string') {
      return DEI_ERRORS.badRequest('Goal title is required', 'عنوان الهدف مطلوب');
    }
    const targetValue = Number(body.targetValue);
    if (!Number.isFinite(targetValue)) {
      return DEI_ERRORS.badRequest(
        'A numeric target value is required',
        'قيمة مستهدفة رقمية مطلوبة'
      );
    }

    const goal = await db.deiGoal.create({
      data: {
        tenantId: user.tenantId,
        title: body.title,
        titleAr: body.titleAr ?? null,
        description: body.description ?? null,
        category: body.category || 'representation',
        targetValue,
        currentValue: Number.isFinite(Number(body.currentValue)) ? Number(body.currentValue) : 0,
        unit: body.unit || '%',
        status: body.status || 'not_started',
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        owner: body.owner ?? null,
        keyResults: body.keyResults ?? null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json(
      { success: true, data: goal, message: 'Goal created', messageAr: 'تم إنشاء الهدف' },
      { status: 201 }
    );
  } catch (error) {
    console.error('DEI goals POST error:', error);
    return DEI_ERRORS.server();
  }
});
