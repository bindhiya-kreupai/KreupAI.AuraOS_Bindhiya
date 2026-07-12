import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { clearanceId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.grantedDate) updateData.grantedDate = new Date(updateData.grantedDate);
    if (updateData.expiryDate) updateData.expiryDate = new Date(updateData.expiryDate);

    const clearance = await db.securityClearance.update({
      where: { clearanceId: params.clearanceId },
      data: updateData,
    });

    return NextResponse.json({ clearance });
  } catch (error) {
    console.error('Failed to update security clearance:', error);
    return NextResponse.json({ error: 'Failed to update security clearance' }, { status: 500 });
  }
}
