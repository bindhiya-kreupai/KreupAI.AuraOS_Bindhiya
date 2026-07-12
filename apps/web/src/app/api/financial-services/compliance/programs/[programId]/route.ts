import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { programId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.lastReviewDate) updateData.lastReviewDate = new Date(updateData.lastReviewDate);
    if (updateData.nextReviewDate) updateData.nextReviewDate = new Date(updateData.nextReviewDate);

    const program = await db.complianceProgram.update({
      where: { programId: params.programId },
      data: updateData,
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('Failed to update compliance program:', error);
    return NextResponse.json({ error: 'Failed to update compliance program' }, { status: 500 });
  }
}
