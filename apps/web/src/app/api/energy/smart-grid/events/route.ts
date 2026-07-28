import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const events = await db.gridEvent.findMany({
      orderBy: { startTime: 'desc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch grid events:', error);
    return NextResponse.json({ error: 'Failed to fetch grid events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await db.gridEvent.create({
      data: {
        eventId: body.eventId || `evt-${Date.now()}`,
        programId: body.programId,
        type: body.type,
        status: body.status || 'active',
        startTime: body.startTime ? new Date(body.startTime) : new Date(),
        endTime: body.endTime ? new Date(body.endTime) : new Date(),
        requiredReduction: body.requiredReduction,
        actualReduction: body.actualReduction || 0,
        impact: body.impact || {},
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Failed to create grid event:', error);
    return NextResponse.json({ error: 'Failed to create grid event' }, { status: 500 });
  }
}
