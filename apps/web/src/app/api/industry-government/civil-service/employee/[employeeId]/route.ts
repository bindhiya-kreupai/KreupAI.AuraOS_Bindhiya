import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { employeeId: string } }) {
  try {
    const grade = await db.civilServiceGrade.findFirst({
      where: { employeeId: params.employeeId },
      orderBy: { createdAt: 'desc' },
    });

    if (!grade) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    return NextResponse.json({ grade });
  } catch (error) {
    console.error('Failed to fetch civil service grade for employee:', error);
    return NextResponse.json({ error: 'Failed to fetch civil service grade' }, { status: 500 });
  }
}
