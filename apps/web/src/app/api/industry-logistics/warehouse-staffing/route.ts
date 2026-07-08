import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const shifts = await prisma.logisticsWarehouseStaffing.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ shifts });
  } catch (error) {
    console.error('Warehouse staffing API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
