import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const initiatives = await db.conservationInitiative.findMany({
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json(initiatives);
  } catch (error) {
    console.error('Failed to fetch initiatives:', error);
    return NextResponse.json({ error: 'Failed to fetch initiatives' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const initiative = await db.conservationInitiative.create({
      data: {
        initiativeId: body.initiativeId || `init-${Date.now()}`,
        name: body.name,
        description: body.description || '',
        targetSavings: body.targetSavings,
        actualSavings: body.actualSavings || 0,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || 'planned',
        budget: body.budget || 0,
        spent: body.spent || 0,
        metrics: body.metrics || {},
      },
    });
    return NextResponse.json(initiative, { status: 201 });
  } catch (error) {
    console.error('Failed to create initiative:', error);
    return NextResponse.json({ error: 'Failed to create initiative' }, { status: 500 });
  }
}
