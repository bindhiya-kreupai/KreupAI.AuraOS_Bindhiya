import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const where: any = {};

    const employeeId = searchParams.get('employeeId');
    if (employeeId) {
      where.targetId = employeeId;
      where.targetType = 'Employee';
    }

    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    const plans = await prisma.developmentPlan.findMany({
      where,
      include: {
        activities: true,
        milestones: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ plans }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching development plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const plan = await prisma.developmentPlan.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
        type: body.type || 'Individual',
        targetType: body.targetType || null,
        targetId: body.targetId || null,
        status: body.status || 'Draft',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        budget: body.budget || null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating development plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const existing = await prisma.developmentPlan.findUnique({
      where: { id: body.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Development plan not found' }, { status: 404 });
    }

    const { id, ...updateFields } = body;
    const dataToUpdate: any = {};

    if (updateFields.name !== undefined) dataToUpdate.name = updateFields.name;
    if (updateFields.description !== undefined) dataToUpdate.description = updateFields.description;
    if (updateFields.status !== undefined) dataToUpdate.status = updateFields.status;
    if (updateFields.startDate !== undefined) dataToUpdate.startDate = new Date(updateFields.startDate);
    if (updateFields.endDate !== undefined) dataToUpdate.endDate = new Date(updateFields.endDate);
    if (updateFields.budget !== undefined) dataToUpdate.budget = updateFields.budget;

    const plan = await prisma.developmentPlan.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating development plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
