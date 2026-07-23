import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function DELETE(req: Request, { params }: { params: { eventId: string } }) {
  try {
    const { eventId } = params;

    // Using deleteMany for safe deletion
    await (db as any).hospitalityEvent.deleteMany({
      where: {
        id: eventId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
