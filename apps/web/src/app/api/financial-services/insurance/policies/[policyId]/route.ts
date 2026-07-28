import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { policyId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.effectiveDate) updateData.effectiveDate = new Date(updateData.effectiveDate);
    if (updateData.expirationDate) updateData.expirationDate = new Date(updateData.expirationDate);

    const policy = await db.insurancePolicy.update({
      where: { policyId: params.policyId },
      data: updateData,
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Failed to update insurance policy:', error);
    return NextResponse.json({ error: 'Failed to update insurance policy' }, { status: 500 });
  }
}
