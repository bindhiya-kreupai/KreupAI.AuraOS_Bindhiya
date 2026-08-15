import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(req: Request) {
  try {
    const pools = await (db as any).tipPool.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mappedPools = pools.map((p: any) => ({
      id: p.id,
      poolId: p.poolId,
      poolName: p.poolName,
      date: p.date,
      totalAmount: p.totalAmount,
      distributionMethod: p.distributionMethod,
      participants: p.participants || [],
      distributions: p.distributions || [],
      status: p.status,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({ pools: mappedPools });
  } catch (error: any) {
    console.error('Failed to fetch tip pools:', error);
    return NextResponse.json({ error: 'Failed to fetch tip pools' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const totalAmount = parseFloat(body.totalAmount) || 0;

    // Define standard roles and points
    const roles = [
      { role: 'Server', points: 10, count: 12 },
      { role: 'Bartender', points: 8, count: 4 },
      { role: 'Busser', points: 5, count: 6 },
      { role: 'Host', points: 3, count: 3 },
    ];

    let totalPoints = 0;
    roles.forEach((r) => (totalPoints += r.points * r.count));

    const distributions = roles.map((r) => {
      const rolePoints = r.points * r.count;
      const sharePct = rolePoints / totalPoints;
      const shareAmt = totalAmount * sharePct;
      const perPerson = shareAmt / r.count;

      return {
        role: r.role,
        points: r.points,
        count: r.count,
        share: Math.round(sharePct * 100) + '%',
        per: '$' + perPerson.toFixed(2),
        shareAmt,
      };
    });

    const newPool = await (db as any).tipPool.create({
      data: {
        poolId: body.poolId || `POOL-${Date.now()}`,
        poolName: body.poolName || 'Daily Pool',
        date: new Date(),
        totalAmount,
        distributionMethod: 'Points-Based',
        participants: roles,
        distributions,
        status: 'Processed',
      },
    });

    return NextResponse.json({ pool: newPool }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create tip pool:', error);
    return NextResponse.json({ error: 'Failed to create tip pool' }, { status: 500 });
  }
}
