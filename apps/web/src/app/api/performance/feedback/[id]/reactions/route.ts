/**
 * Toggle an emoji reaction on a continuous-feedback / recognition item.
 * Persists to aura_continuous_feedback_reaction (unique feedbackId+userId+type).
 * userId is always the authenticated actor — never trusted from the client.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const schema = z.object({ type: z.string().min(1) });

function actor(user: { userId: string; employeeId?: string }): string {
  return user.employeeId || user.userId;
}

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const actorId = actor(user);
    const feedbackId = params.id;
    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Reaction type is required',
            messageAr: 'نوع التفاعل مطلوب',
          },
        },
        { status: 400 }
      );
    }

    const feedback = await (prisma as any).continuousFeedback.findFirst({
      where: { id: feedbackId, tenantId: user.tenantId, isDeleted: false },
    });
    if (!feedback) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'Feedback not found', messageAr: 'الملاحظة غير موجودة' },
        },
        { status: 404 }
      );
    }

    const existing = await (prisma as any).continuousFeedbackReaction.findFirst({
      where: { feedbackId, userId: actorId, type: parsed.data.type },
    });
    let hasReacted: boolean;
    if (existing) {
      await (prisma as any).continuousFeedbackReaction.delete({ where: { id: existing.id } });
      hasReacted = false;
    } else {
      await (prisma as any).continuousFeedbackReaction.create({
        data: {
          tenantId: user.tenantId,
          feedbackId,
          userId: actorId,
          type: parsed.data.type,
        },
      });
      hasReacted = true;
    }

    const all = await (prisma as any).continuousFeedbackReaction.findMany({
      where: { feedbackId, type: parsed.data.type },
    });
    return NextResponse.json({
      success: true,
      type: parsed.data.type,
      count: all.length,
      hasReacted,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to toggle reaction',
          messageAr: 'فشل في تبديل التفاعل',
        },
      },
      { status: 500 }
    );
  }
});
