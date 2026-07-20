import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEARNING, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const learnerId = searchParams.get('learnerId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (learnerId) where.employeeId = learnerId;
    if (status) where.status = status;

    const records = await prisma.externalTraining.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error fetching external training');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch external training',
        messageAr: 'فشل في جلب التدريب الخارجي',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEARNING, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    if (!body.title) {
      return NextResponse.json(
        { success: false, message: 'Title is required', messageAr: 'العنوان مطلوب' },
        { status: 400 }
      );
    }

    const record = await prisma.externalTraining.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.learnerId || body.employeeId || user.userId,
        title: body.title,
        provider: body.provider ?? null,
        category: body.category ?? null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        cost: body.cost != null ? Number(body.cost) : null,
        currency: body.currency || 'AED',
        status: body.status || 'pending',
        certificateUrl: body.certificateUrl ?? null,
        notes: body.notes ?? null,
        createdBy: user.userId,
      },
    });

    logger.info({ id: record.id }, 'External training created');
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error creating external training');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create external training',
        messageAr: 'فشل في إنشاء التدريب الخارجي',
      },
      { status: 500 }
    );
  }
});
