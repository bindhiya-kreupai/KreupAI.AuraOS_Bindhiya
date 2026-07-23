import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { employeeId: string } }) {
  try {
    const clearance = await db.securityClearance.findFirst({
      where: { employeeId: params.employeeId },
      orderBy: { grantedDate: 'desc' },
    });

    if (!clearance) {
      return NextResponse.json({ error: 'Clearance not found' }, { status: 404 });
    }

    return NextResponse.json({ clearance });
  } catch (error) {
    console.error('Failed to fetch security clearance for employee:', error);
    return NextResponse.json({ error: 'Failed to fetch security clearance' }, { status: 500 });
  }
}
