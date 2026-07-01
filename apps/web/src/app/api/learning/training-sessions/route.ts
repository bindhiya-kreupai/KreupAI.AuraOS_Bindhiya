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
    const status = searchParams.get('status');
    const courseId = searchParams.get('courseId');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;

    const sessions = await prisma.trainingSession.findMany({
      where,
      include: { attendees: true },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error fetching training sessions');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch training sessions',
        messageAr: 'فشل في جلب الجلسات التدريبية',
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
    if (!body.title || !body.startDate || !body.endDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'title, startDate and endDate are required',
          messageAr: 'العنوان وتاريخ البدء وتاريخ الانتهاء مطلوبة',
        },
        { status: 400 }
      );
    }

    const session = await prisma.trainingSession.create({
      data: {
        tenantId: user.tenantId,
        title: body.title,
        description: body.description ?? null,
        type: body.type || 'classroom',
        courseId: body.courseId ?? null,
        instructor: body.instructor ?? null,
        location: body.location ?? null,
        meetingUrl: body.meetingUrl ?? null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        maxCapacity: body.maxCapacity ? Number(body.maxCapacity) : null,
        status: body.status || 'scheduled',
        materials: body.materials ?? undefined,
        createdBy: user.userId,
      },
    });

    logger.info({ id: session.id }, 'Training session created');
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error creating training session');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create training session',
        messageAr: 'فشل في إنشاء الجلسة التدريبية',
      },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEARNING, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required', messageAr: 'معرف الجلسة مطلوب' },
        { status: 400 }
      );
    }

    const existing = await prisma.trainingSession.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Training session not found',
          messageAr: 'الجلسة التدريبية غير موجودة',
        },
        { status: 404 }
      );
    }

    const session = await prisma.trainingSession.update({
      where: { id },
      data: {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.instructor !== undefined && { instructor: updates.instructor }),
        ...(updates.location !== undefined && { location: updates.location }),
        ...(updates.meetingUrl !== undefined && { meetingUrl: updates.meetingUrl }),
        ...(updates.startDate !== undefined && { startDate: new Date(updates.startDate) }),
        ...(updates.endDate !== undefined && { endDate: new Date(updates.endDate) }),
        ...(updates.maxCapacity !== undefined && {
          maxCapacity: updates.maxCapacity ? Number(updates.maxCapacity) : null,
        }),
        updatedBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: session });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error updating training session');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update training session',
        messageAr: 'فشل في تحديث الجلسة التدريبية',
      },
      { status: 500 }
    );
  }
});
