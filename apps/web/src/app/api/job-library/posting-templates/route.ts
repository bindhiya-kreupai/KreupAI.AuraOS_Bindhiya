import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Job Posting Templates API — reusable, standardized job-advert templates.
 * Tenant-scoped. Backed by the JobPostingTemplate model (accessed via
 * prisma-as-any because it is a new module table merged outside the base schema).
 */

const db = prisma as any;

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category')?.trim();

    const where: Record<string, unknown> = { tenantId: user.tenantId, isActive: true };
    if (category) where.category = category;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const items = await db.jobPostingTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: { items, total: items.length, page: 1, pageSize: items.length, hasNextPage: false },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching posting templates');
    return NextResponse.json(
      {
        error: 'Failed to fetch posting templates',
        message: 'Failed to fetch posting templates',
        messageAr: 'فشل في جلب قوالب الإعلانات الوظيفية',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { name, category, sections, body: templateBody } = body ?? {};

    if (!name) {
      return NextResponse.json(
        { error: 'name is required', message: 'name is required', messageAr: 'الاسم مطلوب' },
        { status: 400 }
      );
    }

    const template = await db.jobPostingTemplate.create({
      data: {
        tenantId: user.tenantId,
        name,
        category: category || 'general',
        sections: Array.isArray(sections) ? sections : [],
        body: templateBody || null,
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    logger.error({ error }, 'Error creating posting template');
    return NextResponse.json(
      {
        error: 'Failed to create posting template',
        message: 'Failed to create posting template',
        messageAr: 'فشل في إنشاء قالب الإعلان الوظيفي',
      },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, action, name, category, sections, body: templateBody } = body ?? {};

    if (!id) {
      return NextResponse.json(
        { error: 'id is required', message: 'id is required', messageAr: 'المعرف مطلوب' },
        { status: 400 }
      );
    }

    const existing = await db.jobPostingTemplate.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        {
          error: 'Template not found',
          message: 'Template not found',
          messageAr: 'القالب غير موجود',
        },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = { updatedBy: user.userId };

    if (action === 'use') {
      data.usageCount = (existing.usageCount ?? 0) + 1;
      data.lastUsedAt = new Date();
    } else {
      if (name !== undefined) data.name = name;
      if (category !== undefined) data.category = category;
      if (sections !== undefined) data.sections = Array.isArray(sections) ? sections : [];
      if (templateBody !== undefined) data.body = templateBody;
    }

    // tenant-ok: id-based op preceded by tenant-scoped findFirst above
    const updated = await db.jobPostingTemplate.update({ where: { id: existing.id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error({ error }, 'Error updating posting template');
    return NextResponse.json(
      {
        error: 'Failed to update posting template',
        message: 'Failed to update posting template',
        messageAr: 'فشل في تحديث قالب الإعلان الوظيفي',
      },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required', message: 'id is required', messageAr: 'المعرف مطلوب' },
        { status: 400 }
      );
    }

    const existing = await db.jobPostingTemplate.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        {
          error: 'Template not found',
          message: 'Template not found',
          messageAr: 'القالب غير موجود',
        },
        { status: 404 }
      );
    }

    // tenant-ok: id-based op preceded by tenant-scoped findFirst above
    await db.jobPostingTemplate.update({
      where: { id: existing.id },
      data: { isActive: false, updatedBy: user.userId },
    });
    return NextResponse.json({ success: true, data: { id: existing.id } });
  } catch (error) {
    logger.error({ error }, 'Error deleting posting template');
    return NextResponse.json(
      {
        error: 'Failed to delete posting template',
        message: 'Failed to delete posting template',
        messageAr: 'فشل في حذف قالب الإعلان الوظيفي',
      },
      { status: 500 }
    );
  }
});
