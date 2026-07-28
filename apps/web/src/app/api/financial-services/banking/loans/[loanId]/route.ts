import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { loanId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const loan = await db.financialLoan.update({
      where: { loanId: params.loanId },
      data: updateData,
    });

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Failed to update financial loan:', error);
    return NextResponse.json({ error: 'Failed to update financial loan' }, { status: 500 });
  }
}
