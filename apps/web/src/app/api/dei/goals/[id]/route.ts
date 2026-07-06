import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { DEI_ERRORS } from '../../_shared';

const db = prisma as any;

/**
 * GET /api/dei/goals/:id — read a goal (with key results).
 * PATCH /api/dei/goals/:id — update progress / fields.
 * DELETE /api/dei/goals/:id — remove a goal.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const goal = await db.deiGoal.findFirst({
      where: { id: params?.id, tenantId: user.tenantId },
    });
    if (!goal) return DEI_ERRORS.notFound('Goal');
    return NextResponse.json({ success: true, data: goal });
  } catch (error) {
    console.error('DEI goal GET error:', error);
    return DEI_ERRORS.server();
  }
});

export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const existing = await db.deiGoal.findFirst({
      where: { id: params?.id, tenantId: user.tenantId },
    });
    if (!existing) return DEI_ERRORS.notFound('Goal');

    const body = await request.json().catch(() => ({}));
    const data: Record<string, unknown> = {};
    if (typeof body.title === 'string') data.title = body.title;
    if (typeof body.description === 'string') data.description = body.description;
    if (typeof body.category === 'string') data.category = body.category;
    if (typeof body.status === 'string') data.status = body.status;
    if (typeof body.owner === 'string') data.owner = body.owner;
    if (Number.isFinite(Number(body.currentValue))) data.currentValue = Number(body.currentValue);
    if (Number.isFinite(Number(body.targetValue))) data.targetValue = Number(body.targetValue);
    if (body.targetDate) data.targetDate = new Date(body.targetDate);
    if (body.keyResults !== undefined) data.keyResults = body.keyResults;

    const goal = await db.deiGoal.update({ where: { id: existing.id }, data });
    return NextResponse.json({
      success: true,
      data: goal,
      message: 'Goal updated',
      messageAr: 'تم تحديث الهدف',
    });
  } catch (error) {
    console.error('DEI goal PATCH error:', error);
    return DEI_ERRORS.server();
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const existing = await db.deiGoal.findFirst({
      where: { id: params?.id, tenantId: user.tenantId },
    });
    if (!existing) return DEI_ERRORS.notFound('Goal');
    await db.deiGoal.delete({ where: { id: existing.id } });
    return NextResponse.json({
      success: true,
      message: 'Goal deleted',
      messageAr: 'تم حذف الهدف',
    });
  } catch (error) {
    console.error('DEI goal DELETE error:', error);
    return DEI_ERRORS.server();
  }
});
