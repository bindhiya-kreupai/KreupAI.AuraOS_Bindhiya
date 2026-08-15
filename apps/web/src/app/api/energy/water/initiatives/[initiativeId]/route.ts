import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { initiativeId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const initiative = await db.conservationInitiative.update({
      where: { initiativeId: params.initiativeId },
      data: updateData,
    });

    return NextResponse.json(initiative);
  } catch (error) {
    console.error('Failed to update initiative:', error);
    return NextResponse.json({ error: 'Failed to update initiative' }, { status: 500 });
  }
}
