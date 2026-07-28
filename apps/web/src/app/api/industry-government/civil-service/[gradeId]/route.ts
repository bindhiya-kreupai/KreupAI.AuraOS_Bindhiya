import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { gradeId: string } }) {
  try {
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.effectiveDate) updateData.effectiveDate = new Date(updateData.effectiveDate);

    const grade = await db.civilServiceGrade.update({
      where: { gradeId: params.gradeId },
      data: updateData,
    });

    return NextResponse.json({ grade });
  } catch (error) {
    console.error('Failed to update civil service grade:', error);
    return NextResponse.json({ error: 'Failed to update civil service grade' }, { status: 500 });
  }
}
