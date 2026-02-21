import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { searchParams } = new URL(request.url);

    const where: any = {};

    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    const competencies = await prisma.competency.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ competencies }, { status: 200 });
  } catch (error) {
    console.error('Error fetching competencies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    const competency = await prisma.competency.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
        status: body.status || 'Active',
      },
    });

    return NextResponse.json({ competency }, { status: 201 });
  } catch (error) {
    console.error('Error creating competency:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Competency ID is required' }, { status: 400 });
    }

    const existing = await prisma.competency.findUnique({
      where: { id: body.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Competency not found' }, { status: 404 });
    }

    const { id, ...updateFields } = body;
    const dataToUpdate: any = {};

    if (updateFields.name !== undefined) dataToUpdate.name = updateFields.name;
    if (updateFields.description !== undefined) dataToUpdate.description = updateFields.description;
    if (updateFields.status !== undefined) dataToUpdate.status = updateFields.status;

    const competency = await prisma.competency.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ competency }, { status: 200 });
  } catch (error) {
    console.error('Error updating competency:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
