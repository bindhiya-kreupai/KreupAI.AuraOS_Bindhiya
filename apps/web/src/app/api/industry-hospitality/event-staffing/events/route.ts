import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const events = await db.hospitalityEvent.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await db.hospitalityEvent.create({
      data: {
        eventId: body.eventId || `evt-${Date.now()}`,
        eventName: body.eventName,
        eventType: body.eventType,
        eventDate: body.eventDate ? new Date(body.eventDate) : new Date(),
        startTime: body.startTime,
        endTime: body.endTime,
        venue: body.venue,
        expectedGuests: body.expectedGuests,
        actualGuests: body.actualGuests,
        staffingPlan: body.staffingPlan || {},
        budget: body.budget || 0,
        actualCost: body.actualCost,
        status: body.status || 'planned',
      },
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
