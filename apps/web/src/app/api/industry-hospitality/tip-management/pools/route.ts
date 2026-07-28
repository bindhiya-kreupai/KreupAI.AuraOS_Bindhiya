import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const pools = await db.tipPool.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ pools });
  } catch (error) {
    console.error('Failed to fetch tip pools:', error);
    return NextResponse.json({ error: 'Failed to fetch tip pools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pool = await db.tipPool.create({
      data: {
        poolId: body.poolId || `pool-${Date.now()}`,
        poolName: body.poolName,
        date: body.date ? new Date(body.date) : new Date(),
        totalAmount: body.totalAmount,
        distributionMethod: body.distributionMethod || 'hours',
        participants: body.participants || [],
        distributions: body.distributions || [],
        status: body.status || 'open',
      },
    });
    return NextResponse.json({ pool }, { status: 201 });
  } catch (error) {
    console.error('Failed to create tip pool:', error);
    return NextResponse.json({ error: 'Failed to create tip pool' }, { status: 500 });
  }
}
