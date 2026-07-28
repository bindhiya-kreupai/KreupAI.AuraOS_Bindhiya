import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { poolId: string } }) {
  try {
    const body = await request.json();
    const pool = await db.tipPool.update({
      where: { poolId: params.poolId },
      data: body,
    });
    return NextResponse.json({ pool });
  } catch (error) {
    console.error('Failed to update tip pool:', error);
    return NextResponse.json({ error: 'Failed to update tip pool' }, { status: 500 });
  }
}
