/**
 * Check-in / 1:1 template CRUD — backed by aura_check_in_template.
 * New model, accessed via (prisma as any).checkInTemplate. Tenant-scoped.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1),
  type: z.string().optional(),
  hint: z.string().optional(),
  isRequired: z.boolean().optional(),
});

const createSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  cadence: z.string().optional(),
  questions: z.array(questionSchema).optional(),
  isDefault: z.boolean().optional(),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().min(1),
  isActive: z.boolean().optional(),
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
    const where: any = { tenantId: user.tenantId, isDeleted: false };
    const category = searchParams.get('category');
    if (category) where.category = category;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      (prisma as any).checkInTemplate.findMany({
        where,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      (prisma as any).checkInTemplate.count({ where }),
    ]);

    return NextResponse.json({
      templates: rows,
      items: rows,
      total,
      page,
      pageSize: limit,
      hasNextPage: skip + rows.length < total,
    });
  } catch (error: any) {
    return err('E5001', 'Failed to fetch templates', 'فشل في جلب القوالب', 500);
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return err('E2001', 'Validation failed', 'فشل التحقق من الصحة', 400, parsed.error.errors);
    }
    const d = parsed.data;
    const created = await (prisma as any).checkInTemplate.create({
      data: {
        tenantId: user.tenantId,
        name: d.name,
        description: d.description || null,
        category: d.category || 'one_on_one',
        cadence: d.cadence || 'weekly',
        questions: d.questions || [],
        isDefault: d.isDefault ?? false,
        createdBy: user.userId,
      },
    });
    return NextResponse.json({ template: created }, { status: 201 });
  } catch (error: any) {
    return err('E5001', 'Failed to create template', 'فشل في إنشاء القالب', 500);
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return err('E2001', 'Validation failed', 'فشل التحقق من الصحة', 400, parsed.error.errors);
    }
    const { id, ...updates } = parsed.data;
    const existing = await (prisma as any).checkInTemplate.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return err('E2001', 'Template not found', 'القالب غير موجود', 404);
    }
    const data: any = { updatedBy: user.userId };
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.category !== undefined) data.category = updates.category;
    if (updates.cadence !== undefined) data.cadence = updates.cadence;
    if (updates.questions !== undefined) data.questions = updates.questions;
    if (updates.isDefault !== undefined) data.isDefault = updates.isDefault;
    if (updates.isActive !== undefined) data.isActive = updates.isActive;

    const updated = await (prisma as any).checkInTemplate.update({ where: { id }, data });
    return NextResponse.json({ template: updated });
  } catch (error: any) {
    return err('E5001', 'Failed to update template', 'فشل في تحديث القالب', 500);
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return err('E2001', 'Template ID is required', 'معرّف القالب مطلوب', 400);
    }
    const existing = await (prisma as any).checkInTemplate.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return err('E2001', 'Template not found', 'القالب غير موجود', 404);
    }
    await (prisma as any).checkInTemplate.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isActive: false, updatedBy: user.userId },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return err('E5001', 'Failed to delete template', 'فشل في حذف القالب', 500);
  }
});
