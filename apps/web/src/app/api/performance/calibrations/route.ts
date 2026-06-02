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

    const reviewCycleId = searchParams.get('reviewCycleId');
    if (reviewCycleId) {
      where.reviewCycleId = reviewCycleId;
    }

    const sessions = await prisma.calibrationSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching calibration sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const session = await prisma.calibrationSession.create({
      data: {
        tenantId: user.tenantId,
        sessionName: body.sessionName,
        reviewCycleId: body.reviewCycleId || null,
        status: body.status || 'scheduled',
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        facilitatorId: body.facilitatorId || user.userId,
        department: body.department || null,
        participants: body.participants || [],
        notes: body.notes || null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating calibration session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const existing = await prisma.calibrationSession.findFirst({
      where: { id: body.id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Calibration session not found' }, { status: 404 });
    }

    const { id, ...updateFields } = body;
    const dataToUpdate: any = {};

    if (updateFields.sessionName !== undefined) dataToUpdate.sessionName = updateFields.sessionName;
    if (updateFields.status !== undefined) dataToUpdate.status = updateFields.status;
    if (updateFields.adjustments !== undefined) dataToUpdate.adjustments = updateFields.adjustments;
    if (updateFields.notes !== undefined) dataToUpdate.notes = updateFields.notes;
    if (updateFields.participants !== undefined) dataToUpdate.participants = updateFields.participants;

    if (updateFields.status === 'completed' && existing.status !== 'completed') {
      dataToUpdate.completedDate = new Date();
    }

    const session = await prisma.calibrationSession.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ session }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating calibration session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
