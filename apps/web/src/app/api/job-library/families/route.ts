import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Job Families API.
 *
 * JobFamily / JobFunction are shared configuration catalog tables (no tenantId
 * column); access is gated by authentication. Each family belongs to a
 * JobFunction and exposes a derived role count from its JobProfiles.
 */

export const GET = withEnhancedAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    const where: Record<string, unknown> = { isDeleted: false };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // tenant-ok: JobFamily is a shared configuration catalog (no tenantId column)
    const families = await prisma.jobFamily.findMany({
      where,
      include: {
        function: { select: { id: true, name: true } },
        _count: { select: { jobProfiles: { where: { isDeleted: false } } } },
      },
      orderBy: { name: 'asc' },
    });

    const items = families.map((f) => ({
      id: f.id,
      code: f.code,
      name: f.name,
      functionId: f.functionId,
      functionName: f.function?.name ?? null,
      roleCount: f._count.jobProfiles,
    }));

    return NextResponse.json({
      success: true,
      data: { items, total: items.length, page: 1, pageSize: items.length, hasNextPage: false },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching job families');
    return NextResponse.json(
      {
        error: 'Failed to fetch job families',
        message: 'Failed to fetch job families',
        messageAr: 'فشل في جلب عائلات الوظائف',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { code, name, functionId } = body ?? {};

    if (!code || !name || !functionId) {
      return NextResponse.json(
        {
          error: 'code, name, and functionId are required',
          message: 'code, name, and functionId are required',
          messageAr: 'الرمز والاسم ومعرف الوظيفة مطلوبة',
        },
        { status: 400 }
      );
    }

    const fn = await prisma.jobFunction.findFirst({ where: { id: functionId, isDeleted: false } });
    if (!fn) {
      return NextResponse.json(
        {
          error: 'Job function not found',
          message: 'Job function not found',
          messageAr: 'الوظيفة الرئيسية غير موجودة',
        },
        { status: 404 }
      );
    }

    const family = await prisma.jobFamily.create({
      data: {
        code,
        name,
        functionId,
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });
    return NextResponse.json({ success: true, data: family });
  } catch (error) {
    logger.error({ error }, 'Error creating job family');
    return NextResponse.json(
      {
        error: 'Failed to create job family',
        message: 'Failed to create job family',
        messageAr: 'فشل في إنشاء عائلة الوظيفة',
      },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, code, name, functionId } = body ?? {};

    if (!id) {
      return NextResponse.json(
        { error: 'id is required', message: 'id is required', messageAr: 'المعرف مطلوب' },
        { status: 400 }
      );
    }

    const existing = await prisma.jobFamily.findFirst({ where: { id, isDeleted: false } });
    if (!existing) {
      return NextResponse.json(
        {
          error: 'Job family not found',
          message: 'Job family not found',
          messageAr: 'عائلة الوظيفة غير موجودة',
        },
        { status: 404 }
      );
    }

    // tenant-ok: shared catalog; existence validated above by id
    const family = await prisma.jobFamily.update({
      where: { id: existing.id },
      data: {
        ...(code !== undefined && { code }),
        ...(name !== undefined && { name }),
        ...(functionId !== undefined && { functionId }),
        updatedBy: user.userId,
      },
    });
    return NextResponse.json({ success: true, data: family });
  } catch (error) {
    logger.error({ error }, 'Error updating job family');
    return NextResponse.json(
      {
        error: 'Failed to update job family',
        message: 'Failed to update job family',
        messageAr: 'فشل في تحديث عائلة الوظيفة',
      },
      { status: 500 }
    );
  }
});
