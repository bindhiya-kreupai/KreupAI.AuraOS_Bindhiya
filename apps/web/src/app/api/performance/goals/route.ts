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

    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    const category = searchParams.get('category');
    if (category) {
      where.category = category;
    }

    const goals = await prisma.performanceGoal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    console.error('Error fetching performance goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const goal = await prisma.performanceGoal.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        reviewCycleId: body.reviewCycleId || null,
        title: body.title,
        description: body.description || null,
        category: body.category || null,
        type: body.type || 'individual',
        status: body.status || 'not_started',
        priority: body.priority || 'medium',
        targetValue: body.targetValue || null,
        currentValue: body.currentValue || null,
        unit: body.unit || null,
        weight: body.weight || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        progress: body.progress || 0,
        parentGoalId: body.parentGoalId || null,
        alignedTo: body.alignedTo || null,
        metrics: body.metrics || null,
        milestones: body.milestones || null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Error creating performance goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    const existing = await prisma.performanceGoal.findFirst({
      where: { id: body.id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const { id, ...updateFields } = body;
    const dataToUpdate: any = {};

    if (updateFields.title !== undefined) dataToUpdate.title = updateFields.title;
    if (updateFields.description !== undefined) dataToUpdate.description = updateFields.description;
    if (updateFields.status !== undefined) dataToUpdate.status = updateFields.status;
    if (updateFields.progress !== undefined) dataToUpdate.progress = updateFields.progress;
    if (updateFields.currentValue !== undefined) dataToUpdate.currentValue = updateFields.currentValue;
    if (updateFields.priority !== undefined) dataToUpdate.priority = updateFields.priority;
    if (updateFields.metrics !== undefined) dataToUpdate.metrics = updateFields.metrics;
    if (updateFields.milestones !== undefined) dataToUpdate.milestones = updateFields.milestones;

    if (updateFields.status === 'completed' && existing.status !== 'completed') {
      dataToUpdate.completedDate = new Date();
      dataToUpdate.progress = 100;
    }

    const goal = await prisma.performanceGoal.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ goal }, { status: 200 });
  } catch (error) {
    console.error('Error updating performance goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
