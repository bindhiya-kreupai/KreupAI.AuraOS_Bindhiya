import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    const where: any = {};
    if (period) where.period = period;

    const reports = await db.salesCommission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Failed to fetch commission reports:', error);
    return NextResponse.json({ error: 'Failed to fetch commission reports' }, { status: 500 });
  }
});
