/**
 * Add / list comments on a continuous-feedback / recognition item.
 * Persists to aura_continuous_feedback_comment. authorId is the authenticated
 * actor — never trusted from the client.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const schema = z.object({ body: z.string().min(1, 'Comment cannot be empty') });

function actor(user: { userId: string; employeeId?: string }): string {
  return user.employeeId || user.userId;
}

async function ensureFeedback(tenantId: string, feedbackId: string) {
  return (prisma as any).continuousFeedback.findFirst({
    where: { id: feedbackId, tenantId, isDeleted: false },
  });
}

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const feedback = await ensureFeedback(user.tenantId, params.id);
    if (!feedback) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'Feedback not found', messageAr: 'الملاحظة غير موجودة' },
        },
        { status: 404 }
      );
    }
    const rows = await (prisma as any).continuousFeedbackComment.findMany({
      where: { tenantId: user.tenantId, feedbackId: params.id, isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });
    const comments = rows.map((c: any) => ({
      id: c.id,
      authorId: c.authorId,
      authorName: '',
      authorRole: '',
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    }));
    return NextResponse.json({ comments });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch comments',
          messageAr: 'فشل في جلب التعليقات',
        },
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const actorId = actor(user);
    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Comment cannot be empty',
            messageAr: 'لا يمكن أن يكون التعليق فارغًا',
          },
        },
        { status: 400 }
      );
    }
    const feedback = await ensureFeedback(user.tenantId, params.id);
    if (!feedback) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'Feedback not found', messageAr: 'الملاحظة غير موجودة' },
        },
        { status: 404 }
      );
    }
    const created = await (prisma as any).continuousFeedbackComment.create({
      data: {
        tenantId: user.tenantId,
        feedbackId: params.id,
        authorId: actorId,
        body: parsed.data.body,
      },
    });
    return NextResponse.json(
      {
        comment: {
          id: created.id,
          authorId: created.authorId,
          authorName: '',
          authorRole: '',
          body: created.body,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to add comment',
          messageAr: 'فشل في إضافة التعليق',
        },
      },
      { status: 500 }
    );
  }
});
