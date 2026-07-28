import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    const technician = await db.technician.findUnique({
      where: { technicianId: params.technicianId },
    });

    if (!technician) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    return NextResponse.json({ technician });
  } catch (error) {
    console.error('Failed to fetch technician:', error);
    return NextResponse.json({ error: 'Failed to fetch technician' }, { status: 500 });
  }
});

export const PUT = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.hireDate) updateData.hireDate = new Date(updateData.hireDate);

    const technician = await db.technician.update({
      where: { technicianId: params.technicianId },
      data: updateData,
    });

    return NextResponse.json({ technician });
  } catch (error) {
    console.error('Failed to update technician:', error);
    return NextResponse.json({ error: 'Failed to update technician' }, { status: 500 });
  }
});

export const DELETE = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    await db.technician.delete({
      where: { technicianId: params.technicianId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete technician:', error);
    return NextResponse.json({ error: 'Failed to delete technician' }, { status: 500 });
  }
});
