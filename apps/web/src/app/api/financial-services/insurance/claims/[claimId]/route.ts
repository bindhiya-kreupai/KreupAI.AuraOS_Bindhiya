import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { claimId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.dateOfLoss) updateData.dateOfLoss = new Date(updateData.dateOfLoss);
    if (updateData.dateReported) updateData.dateReported = new Date(updateData.dateReported);

    const claim = await db.insuranceClaim.update({
      where: { claimId: params.claimId },
      data: updateData,
    });

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Failed to update insurance claim:', error);
    return NextResponse.json({ error: 'Failed to update insurance claim' }, { status: 500 });
  }
}
