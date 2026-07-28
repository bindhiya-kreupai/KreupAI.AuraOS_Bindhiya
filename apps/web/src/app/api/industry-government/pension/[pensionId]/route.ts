import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { pensionId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.enrollmentDate) updateData.enrollmentDate = new Date(updateData.enrollmentDate);
    if (updateData.serviceComputationDate)
      updateData.serviceComputationDate = new Date(updateData.serviceComputationDate);

    const pension = await db.pensionScheme.update({
      where: { pensionId: params.pensionId },
      data: updateData,
    });

    return NextResponse.json({ pension });
  } catch (error) {
    console.error('Failed to update pension scheme:', error);
    return NextResponse.json({ error: 'Failed to update pension scheme' }, { status: 500 });
  }
}
