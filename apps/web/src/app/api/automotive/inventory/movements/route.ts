import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request) {
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
}
