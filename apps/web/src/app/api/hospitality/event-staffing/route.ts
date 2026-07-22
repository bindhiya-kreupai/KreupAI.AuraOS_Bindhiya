import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(req: Request) {
  try {
    const events = await (db as any).hospitalityEvent.findMany({
      orderBy: {
        eventDate: 'asc',
      },
    });

    const mappedEvents = events.map((e: any) => ({
      id: e.id,
      eventId: e.eventId,
      eventName: e.eventName,
      eventType: e.eventType,
      eventDate: e.eventDate,
      startTime: e.startTime,
      endTime: e.endTime,
      venue: e.venue,
      expectedGuests: e.expectedGuests,
      actualGuests: e.actualGuests,
      staffingPlan: e.staffingPlan || { required: 0, filled: 0 },
      budget: e.budget,
      actualCost: e.actualCost,
      status: e.status,
    }));

    return NextResponse.json({ events: mappedEvents });
  } catch (error: any) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Dynamically compute staffing plan
    const requiredStaff = Math.ceil((body.expectedGuests || 100) / 20); // 1 staff per 20 guests
    const filledStaff = body.status === 'Ready' ? requiredStaff : Math.floor(requiredStaff * 0.7); // Simulate short staffing if not ready

    const newEvent = await (db as any).hospitalityEvent.create({
      data: {
        eventId: body.eventId || `EVT-${Date.now()}`,
        eventName: body.eventName || 'Corporate Banquet',
        eventType: body.eventType || 'Banquet',
        eventDate: new Date(body.eventDate || Date.now()),
        startTime: body.startTime || '18:00',
        endTime: body.endTime || '22:00',
        venue: body.venue || 'Grand Ballroom',
        expectedGuests: body.expectedGuests || 100,
        actualGuests: 0,
        staffingPlan: {
          required: requiredStaff,
          filled: filledStaff,
        },
        budget: (body.expectedGuests || 100) * 50,
        actualCost: 0,
        status: body.status || 'Ready',
      },
    });

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
