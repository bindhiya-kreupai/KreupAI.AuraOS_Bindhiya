import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { technicianId: string } }) {
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
}

export async function PUT(request: Request, { params }: { params: { technicianId: string } }) {
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
}

export async function DELETE(request: Request, { params }: { params: { technicianId: string } }) {
  try {
    await db.technician.delete({
      where: { technicianId: params.technicianId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete technician:', error);
    return NextResponse.json({ error: 'Failed to delete technician' }, { status: 500 });
  }
}
