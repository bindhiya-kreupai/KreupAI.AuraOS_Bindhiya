import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Job Catalog API — master list of job profiles.
 *
 * JobProfile / JobFamily are shared configuration catalog tables (no tenantId
 * column in the schema); access is gated by authentication. Grade is resolved
 * by id lookup because JobProfile carries only `gradeId`, not a Prisma relation.
 */

interface CatalogRow {
  id: string;
  code: string;
  title: string;
  status: string;
  updatedAt: Date;
  family: { id: string; name: string } | null;
  grade: { id: string; code: string } | null;
}

export const GET = withEnhancedAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();
    const familyId = searchParams.get('familyId')?.trim();

    const where: Record<string, unknown> = { isDeleted: false };
    if (status) where.status = status;
    if (familyId) where.familyId = familyId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // tenant-ok: JobProfile is a shared configuration catalog (no tenantId column)
    const jobs = await prisma.jobProfile.findMany({
      where,
      include: { family: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    const gradeIds = Array.from(
      new Set(jobs.map((j) => j.gradeId).filter((g): g is string => Boolean(g)))
    );
    const grades = gradeIds.length
      ? await prisma.grade.findMany({
          where: { id: { in: gradeIds } },
          select: { id: true, code: true },
        })
      : [];
    const gradeMap = new Map(grades.map((g) => [g.id, g]));

    const items: CatalogRow[] = jobs.map((j) => ({
      id: j.id,
      code: j.code,
      title: j.title,
      status: j.status,
      updatedAt: j.updatedAt,
      family: j.family ? { id: j.family.id, name: j.family.name } : null,
      grade: j.gradeId ? (gradeMap.get(j.gradeId) ?? null) : null,
    }));

    return NextResponse.json({
      success: true,
      data: { items, total: items.length, page: 1, pageSize: items.length, hasNextPage: false },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching job catalog');
    return NextResponse.json(
      {
        error: 'Failed to fetch job catalog',
        message: 'Failed to fetch job catalog',
        messageAr: 'فشل في جلب دليل الوظائف',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { code, title, familyId, gradeId, description, status } = body ?? {};

    if (!code || !title || !familyId) {
      return NextResponse.json(
        {
          error: 'code, title, and familyId are required',
          message: 'code, title, and familyId are required',
          messageAr: 'الرمز والعنوان ومعرف عائلة الوظيفة مطلوبة',
        },
        { status: 400 }
      );
    }

    const family = await prisma.jobFamily.findFirst({ where: { id: familyId, isDeleted: false } });
    if (!family) {
      return NextResponse.json(
        {
          error: 'Job family not found',
          message: 'Job family not found',
          messageAr: 'عائلة الوظيفة غير موجودة',
        },
        { status: 404 }
      );
    }

    const job = await prisma.jobProfile.create({
      data: {
        code,
        title,
        description: description ?? null,
        familyId,
        gradeId: gradeId || null,
        status: status || 'Active',
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    logger.error({ error }, 'Error creating job profile');
    return NextResponse.json(
      {
        error: 'Failed to create job profile',
        message: 'Failed to create job profile',
        messageAr: 'فشل في إنشاء ملف الوظيفة',
      },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, code, title, familyId, gradeId, description, status } = body ?? {};

    if (!id) {
      return NextResponse.json(
        { error: 'id is required', message: 'id is required', messageAr: 'المعرف مطلوب' },
        { status: 400 }
      );
    }

    const existing = await prisma.jobProfile.findFirst({ where: { id, isDeleted: false } });
    if (!existing) {
      return NextResponse.json(
        {
          error: 'Job profile not found',
          message: 'Job profile not found',
          messageAr: 'ملف الوظيفة غير موجود',
        },
        { status: 404 }
      );
    }

    // tenant-ok: shared catalog; existence validated above by id
    const job = await prisma.jobProfile.update({
      where: { id: existing.id },
      data: {
        ...(code !== undefined && { code }),
        ...(title !== undefined && { title }),
        ...(familyId !== undefined && { familyId }),
        ...(gradeId !== undefined && { gradeId: gradeId || null }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        updatedBy: user.userId,
      },
    });
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    logger.error({ error }, 'Error updating job profile');
    return NextResponse.json(
      {
        error: 'Failed to update job profile',
        message: 'Failed to update job profile',
        messageAr: 'فشل في تحديث ملف الوظيفة',
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

    const existing = await prisma.jobProfile.findFirst({ where: { id, isDeleted: false } });
    if (!existing) {
      return NextResponse.json(
        {
          error: 'Job profile not found',
          message: 'Job profile not found',
          messageAr: 'ملف الوظيفة غير موجود',
        },
        { status: 404 }
      );
    }

    // tenant-ok: shared catalog; soft-delete after id existence check
    await prisma.jobProfile.update({
      where: { id: existing.id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId },
    });
    return NextResponse.json({ success: true, data: { id: existing.id } });
  } catch (error) {
    logger.error({ error }, 'Error deleting job profile');
    return NextResponse.json(
      {
        error: 'Failed to delete job profile',
        message: 'Failed to delete job profile',
        messageAr: 'فشل في حذف ملف الوظيفة',
      },
      { status: 500 }
    );
  }
});
