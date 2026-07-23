import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.eventDate) updateData.eventDate = new Date(updateData.eventDate);

    const event = await db.hospitalityEvent.update({
      where: { eventId: params.eventId },
      data: updateData,
    });
    return NextResponse.json({ event });
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
