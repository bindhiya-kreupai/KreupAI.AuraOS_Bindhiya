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

    const employeeId = searchParams.get('employeeId');
    if (employeeId) {
      where.employeeId = employeeId;
    }

    const reviewCycleId = searchParams.get('reviewCycleId');
    if (reviewCycleId) {
      where.reviewCycleId = reviewCycleId;
    }

    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    const reviews = await prisma.performanceReview.findMany({
      where,
      include: {
        cycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching performance reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const review = await prisma.performanceReview.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        reviewCycleId: body.reviewCycleId || null,
        reviewerId: body.reviewerId || user.userId,
        reviewType: body.reviewType || 'annual',
        status: body.status || 'draft',
        selfRating: body.selfRating || null,
        managerRating: body.managerRating || null,
        finalRating: body.finalRating || null,
        selfComments: body.selfComments || null,
        managerComments: body.managerComments || null,
        strengths: body.strengths || null,
        improvements: body.improvements || null,
        goals: body.goals || null,
        competencies: body.competencies || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating performance review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const existing = await prisma.performanceReview.findFirst({
      where: { id: body.id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const { id, ...updateFields } = body;
    const dataToUpdate: any = {};

    if (updateFields.status !== undefined) dataToUpdate.status = updateFields.status;
    if (updateFields.selfRating !== undefined) dataToUpdate.selfRating = updateFields.selfRating;
    if (updateFields.managerRating !== undefined) dataToUpdate.managerRating = updateFields.managerRating;
    if (updateFields.finalRating !== undefined) dataToUpdate.finalRating = updateFields.finalRating;
    if (updateFields.selfComments !== undefined) dataToUpdate.selfComments = updateFields.selfComments;
    if (updateFields.managerComments !== undefined) dataToUpdate.managerComments = updateFields.managerComments;
    if (updateFields.strengths !== undefined) dataToUpdate.strengths = updateFields.strengths;
    if (updateFields.improvements !== undefined) dataToUpdate.improvements = updateFields.improvements;
    if (updateFields.goals !== undefined) dataToUpdate.goals = updateFields.goals;
    if (updateFields.competencies !== undefined) dataToUpdate.competencies = updateFields.competencies;

    if (updateFields.status === 'submitted' && existing.status !== 'submitted') {
      dataToUpdate.submittedAt = new Date();
    }
    if (updateFields.status === 'completed' && existing.status !== 'completed') {
      dataToUpdate.completedAt = new Date();
    }

    const review = await prisma.performanceReview.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ review }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating performance review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
