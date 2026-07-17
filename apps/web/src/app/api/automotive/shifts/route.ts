import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async () => {
  try {
    const shifts = await db.technicianShift.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ shifts });
  } catch (error) {
    console.error('Failed to fetch shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
});

export const POST = createProtectedRoute(async (request: Request) => {
  try {
    const body = await request.json();
    const shift = await db.technicianShift.create({
      data: {
        shiftId: body.shiftId || `shift-${Date.now()}`,
        technicianId: body.technicianId,
        technicianName: body.technicianName,
        date: body.date ? new Date(body.date) : new Date(),
        startTime: body.startTime,
        endTime: body.endTime,
        type: body.type,
        status: body.status || 'scheduled',
        notes: body.notes || null,
      },
    });
    return NextResponse.json({ shift }, { status: 201 });
  } catch (error) {
    console.error('Failed to create shift:', error);
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  }
});
