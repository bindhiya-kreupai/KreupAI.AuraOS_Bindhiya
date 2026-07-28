import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const movements = await db.inventoryMovement.findMany({
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json({ movements });
  } catch (error) {
    console.error('Failed to fetch inventory movements:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory movements' }, { status: 500 });
  }
});
