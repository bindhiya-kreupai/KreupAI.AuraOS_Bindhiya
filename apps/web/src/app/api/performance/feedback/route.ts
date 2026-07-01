/**
 * Continuous Feedback API — backed by the real `ContinuousFeedback` model
 * (aura_continuous_feedback). Maps the client service contract
 * (category/visibility/toId/message/tags) onto the schema
 * (type/visibility/toEmployeeId/message/tags). `fromUserId` is always derived
 * server-side from the authenticated user — never trusted from the client.
 *
 * Recognition (Praise Wall) rides on the same table via type='RECOGNITION'.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// Client category <-> stored type mapping.
const CATEGORY_TO_TYPE: Record<string, string> = {
  praise: 'RECOGNITION',
  constructive: 'CONSTRUCTIVE',
  suggestion: 'SUGGESTION',
};
const TYPE_TO_CATEGORY: Record<string, 'praise' | 'constructive' | 'suggestion'> = {
  RECOGNITION: 'praise',
  PRAISE: 'praise',
  CONTINUOUS: 'praise',
  CONSTRUCTIVE: 'constructive',
  SUGGESTION: 'suggestion',
  FORMAL: 'constructive',
};

const createSchema = z.object({
  // Accept both the UI contract (category/toId) and a raw contract (type/toEmployeeId).
  category: z.enum(['praise', 'constructive', 'suggestion']).optional(),
  type: z.string().optional(),
  toId: z.string().optional(),
  toEmployeeId: z.string().optional(),
  toName: z.string().optional(),
  visibility: z.enum(['public', 'private', 'anonymous']).default('public'),
  message: z.string().min(10, 'Feedback must be at least 10 characters'),
  tags: z.array(z.string()).optional().default([]),
  linkedGoalId: z.string().optional(),
});

function currentActor(user: { userId: string; employeeId?: string }): string {
  return user.employeeId || user.userId;
}

function bilingual(message: string, messageAr: string, status: number, code = 'E4000') {
  return NextResponse.json({ success: false, error: { code, message, messageAr } }, { status });
}

// Shape a stored row into the FeedbackItem the client service expects.
type ReactionRow = { type: string; userId: string };
type CommentRow = {
  id: string;
  authorId: string;
  body: string;
  createdAt: Date;
};

function mapFeedbackItem(
  row: any,
  actorId: string,
  reactions: ReactionRow[],
  comments: CommentRow[]
) {
  const grouped = new Map<string, { count: number; hasReacted: boolean }>();
  for (const r of reactions) {
    const g = grouped.get(r.type) || { count: 0, hasReacted: false };
    g.count += 1;
    if (r.userId === actorId) g.hasReacted = true;
    grouped.set(r.type, g);
  }
  const category = TYPE_TO_CATEGORY[row.type] || 'praise';
  const isAnon = row.isAnonymous || row.visibility === 'ANONYMOUS';
  return {
    id: row.id,
    category,
    visibility: (row.visibility || 'PUBLIC').toLowerCase(),
    status: row.status || 'active',
    fromId: isAnon ? 'anon' : row.fromUserId,
    fromName: isAnon ? 'Anonymous' : '',
    fromRole: '',
    fromDepartment: '',
    toId: row.toEmployeeId,
    toName: '',
    toRole: '',
    toDepartment: '',
    message: row.message,
    tags: row.tags || [],
    reactions: Array.from(grouped.entries()).map(([type, g]) => ({
      type,
      count: g.count,
      hasReacted: g.hasReacted,
    })),
    comments: comments.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorName: '',
      authorRole: '',
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    })),
    linkedGoalId: row.relatedGoalId || undefined,
    createdAt: (row.createdAt instanceof Date
      ? row.createdAt
      : new Date(row.createdAt)
    ).toISOString(),
    updatedAt: (row.updatedAt instanceof Date
      ? row.updatedAt
      : new Date(row.updatedAt)
    ).toISOString(),
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const actorId = currentActor(user);
    const { searchParams } = new URL(request.url);

    const where: any = { tenantId: user.tenantId, isDeleted: false };

    const direction = searchParams.get('direction');
    if (direction === 'received') where.toEmployeeId = actorId;
    else if (direction === 'given') where.fromUserId = actorId;

    const category = searchParams.get('category');
    if (category && category !== 'all' && CATEGORY_TO_TYPE[category]) {
      where.type = CATEGORY_TO_TYPE[category];
    }
    const type = searchParams.get('type');
    if (type) where.type = type;

    const employeeId = searchParams.get('employeeId');
    if (employeeId) where.toEmployeeId = employeeId;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      (prisma as any).continuousFeedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).continuousFeedback.count({ where }),
    ]);

    const ids = rows.map((r: any) => r.id);
    const [reactions, comments] = await Promise.all([
      ids.length
        ? (prisma as any).continuousFeedbackReaction.findMany({
            where: { tenantId: user.tenantId, feedbackId: { in: ids } },
          })
        : [],
      ids.length
        ? (prisma as any).continuousFeedbackComment.findMany({
            where: { tenantId: user.tenantId, feedbackId: { in: ids }, isDeleted: false },
            orderBy: { createdAt: 'asc' },
          })
        : [],
    ]);

    const items = rows.map((r: any) =>
      mapFeedbackItem(
        r,
        actorId,
        reactions.filter((x: any) => x.feedbackId === r.id),
        comments.filter((x: any) => x.feedbackId === r.id)
      )
    );

    return NextResponse.json({
      feedback: items,
      items,
      total,
      page,
      pageSize: limit,
      hasNextPage: skip + rows.length < total,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch feedback',
          messageAr: 'فشل في جلب الملاحظات',
        },
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const actorId = currentActor(user);
    const body = await request.json().catch(() => null);
    if (!body) {
      return bilingual('Invalid JSON body', 'نص الطلب غير صالح', 400, 'E2001');
    }
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed',
            messageAr: 'فشل التحقق من الصحة',
            details: parsed.error.errors,
          },
        },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const toEmployeeId = data.toEmployeeId || data.toId;
    if (!toEmployeeId) {
      return bilingual('Recipient is required', 'المستلم مطلوب', 400, 'E2001');
    }
    const storedType =
      data.type || (data.category ? CATEGORY_TO_TYPE[data.category] : 'RECOGNITION');
    const visibility = (data.visibility || 'public').toUpperCase();

    const created = await (prisma as any).continuousFeedback.create({
      data: {
        tenantId: user.tenantId,
        fromUserId: actorId,
        toEmployeeId,
        type: storedType,
        message: data.message,
        visibility,
        isAnonymous: visibility === 'ANONYMOUS',
        relatedGoalId: data.linkedGoalId || null,
        tags: data.tags || [],
        status: 'active',
        createdBy: user.userId,
      },
    });

    const item = mapFeedbackItem(created, actorId, [], []);
    return NextResponse.json({ feedback: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create feedback',
          messageAr: 'فشل في إنشاء الملاحظة',
        },
      },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const actorId = currentActor(user);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return bilingual('Feedback ID is required', 'معرّف الملاحظة مطلوب', 400, 'E2001');
    }
    const existing = await (prisma as any).continuousFeedback.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return bilingual('Feedback not found', 'الملاحظة غير موجودة', 404, 'E2001');
    }
    if (existing.fromUserId !== actorId) {
      return bilingual(
        'You can only delete your own feedback',
        'يمكنك حذف ملاحظاتك فقط',
        403,
        'E4030'
      );
    }
    await (prisma as any).continuousFeedback.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), status: 'archived', updatedBy: user.userId },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to delete feedback',
          messageAr: 'فشل في حذف الملاحظة',
        },
      },
      { status: 500 }
    );
  }
});
