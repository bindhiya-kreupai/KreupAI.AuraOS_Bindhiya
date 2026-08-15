import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { employeeId: string } }) {
  try {
    const pension = await db.pensionScheme.findFirst({
      where: { employeeId: params.employeeId },
      orderBy: { createdAt: 'desc' },
    });

    if (!pension) {
      return NextResponse.json({ error: 'Pension scheme not found' }, { status: 404 });
    }

    return NextResponse.json({ pension });
  } catch (error) {
    console.error('Failed to fetch pension scheme for employee:', error);
    return NextResponse.json({ error: 'Failed to fetch pension scheme' }, { status: 500 });
  }
}
