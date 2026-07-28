import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { leakId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.detectedAt) updateData.detectedAt = new Date(updateData.detectedAt);
    if (updateData.repairedAt) updateData.repairedAt = new Date(updateData.repairedAt);

    const leak = await db.leakDetection.update({
      where: { leakId: params.leakId },
      data: updateData,
    });

    return NextResponse.json(leak);
  } catch (error) {
    console.error('Failed to update leak:', error);
    return NextResponse.json({ error: 'Failed to update leak' }, { status: 500 });
  }
}
