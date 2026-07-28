import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const PUT = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.date) updateData.date = new Date(updateData.date);

    const shift = await db.technicianShift.update({
      where: { shiftId: params.shiftId },
      data: updateData,
    });

    return NextResponse.json({ shift });
  } catch (error) {
    console.error('Failed to update shift:', error);
    return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 });
  }
});

export const DELETE = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    await db.technicianShift.delete({
      where: { shiftId: params.shiftId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete shift:', error);
    return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
  }
});
