/**
 * Goal templates library API — backed by aura_goal_template, accessed via
 * (prisma as any).goalTemplate. Tenant-scoped. Powers the reusable KPI/objective
 * library and "Use this goal" flow, which increments usageCount.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  metric: z.string().optional(),
  suggestedTarget: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

function err(code: string, message: string, messageAr: string, status: number, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, messageAr, ...(details ? { details } : {}) } },
    { status }
  );
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const where: any = { tenantId: user.tenantId, isDeleted: false, isActive: true };
    const category = searchParams.get('category');
    if (category && category !== 'All') where.category = category;
    const search = searchParams.get('search');
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { metric: { contains: search, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '100')));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      (prisma as any).goalTemplate.findMany({
        where,
        orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      (prisma as any).goalTemplate.count({ where }),
    ]);

    return NextResponse.json({
      items: rows,
      total,
      page,
      pageSize: limit,
      hasNextPage: skip + rows.length < total,
    });
  } catch (error) {
    return err('E5001', 'Failed to fetch goal templates', 'فشل في جلب قوالب الأهداف', 500);
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json().catch(() => null);
    if (!body) return err('E2001', 'Invalid JSON body', 'نص الطلب غير صالح', 400);

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return err('E2001', 'Validation failed', 'فشل التحقق من الصحة', 400, parsed.error.errors);
    }
    const data = parsed.data;
    const created = await (prisma as any).goalTemplate.create({
      data: {
        tenantId: user.tenantId,
        title: data.title,
        description: data.description || null,
        category: data.category || 'General',
        metric: data.metric || null,
        suggestedTarget: data.suggestedTarget || null,
        tags: data.tags || [],
        createdBy: user.userId,
      },
    });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    return err('E5001', 'Failed to create goal template', 'فشل في إنشاء قالب الهدف', 500);
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  // Used by "Use this goal" to increment usageCount for a template.
  try {
    const { user } = context;
    const body = await request.json().catch(() => null);
    if (!body?.id) return err('E2001', 'Template ID is required', 'معرّف القالب مطلوب', 400);

    const existing = await (prisma as any).goalTemplate.findFirst({
      where: { id: body.id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return err('E4004', 'Template not found', 'القالب غير موجود', 404);

    const updated = await (prisma as any).goalTemplate.update({
      where: { id: body.id },
      data:
        body.action === 'use'
          ? { usageCount: { increment: 1 } }
          : {
              title: body.title ?? existing.title,
              description: body.description ?? existing.description,
              category: body.category ?? existing.category,
              metric: body.metric ?? existing.metric,
              suggestedTarget: body.suggestedTarget ?? existing.suggestedTarget,
              tags: body.tags ?? existing.tags,
              updatedBy: user.userId,
            },
    });
    return NextResponse.json({ item: updated });
  } catch (error) {
    return err('E5001', 'Failed to update goal template', 'فشل في تحديث قالب الهدف', 500);
  }
});
