import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const loadManagement = await db.loadManagement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(loadManagement);
  } catch (error) {
    console.error('Failed to fetch load management:', error);
    return NextResponse.json({ error: 'Failed to fetch load management' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loadManagement = await db.loadManagement.create({
      data: {
        programId: body.programId || `lm-${Date.now()}`,
        name: body.name,
        type: body.type,
        status: body.status || 'active',
        targetReduction: body.targetReduction,
        actualReduction: body.actualReduction || 0,
        events: body.events || [],
      },
    });
    return NextResponse.json(loadManagement, { status: 201 });
  } catch (error) {
    console.error('Failed to create load management:', error);
    return NextResponse.json({ error: 'Failed to create load management' }, { status: 500 });
  }
}
