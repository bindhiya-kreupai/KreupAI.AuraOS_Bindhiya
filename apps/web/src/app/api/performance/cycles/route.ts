import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const where: any = {
      tenantId: user.tenantId,
    };

    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const cycles = await prisma.reviewCycle.findMany({
      where,
      include: {
        reviews: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ cycles }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching review cycles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const cycle = await prisma.reviewCycle.create({
      data: {
        tenantId: user.tenantId,
        cycleName: body.cycleName,
        cycleType: body.cycleType || 'annual',
        status: body.status || 'draft',
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        selfReviewStart: body.selfReviewStart ? new Date(body.selfReviewStart) : null,
        selfReviewEnd: body.selfReviewEnd ? new Date(body.selfReviewEnd) : null,
        managerReviewStart: body.managerReviewStart ? new Date(body.managerReviewStart) : null,
        managerReviewEnd: body.managerReviewEnd ? new Date(body.managerReviewEnd) : null,
        calibrationStart: body.calibrationStart ? new Date(body.calibrationStart) : null,
        calibrationEnd: body.calibrationEnd ? new Date(body.calibrationEnd) : null,
        description: body.description || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ cycle }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review cycle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Cycle ID is required' }, { status: 400 });
    }

    const existing = await prisma.reviewCycle.findFirst({
      where: { id: body.id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Review cycle not found' }, { status: 404 });
    }

    const { id, ...updateFields } = body;
    const dataToUpdate: any = {};

    if (updateFields.cycleName !== undefined) dataToUpdate.cycleName = updateFields.cycleName;
    if (updateFields.status !== undefined) dataToUpdate.status = updateFields.status;
    if (updateFields.isActive !== undefined) dataToUpdate.isActive = updateFields.isActive;
    if (updateFields.description !== undefined) dataToUpdate.description = updateFields.description;
    if (updateFields.startDate !== undefined) dataToUpdate.startDate = new Date(updateFields.startDate);
    if (updateFields.endDate !== undefined) dataToUpdate.endDate = new Date(updateFields.endDate);

    const cycle = await prisma.reviewCycle.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ cycle }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating review cycle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
