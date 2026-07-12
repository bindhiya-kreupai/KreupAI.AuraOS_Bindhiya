import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { technicianId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { technicianId: params.technicianId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const shifts = await db.technicianShift.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ shifts });
  } catch (error) {
    console.error('Failed to fetch technician shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch technician shifts' }, { status: 500 });
  }
}
