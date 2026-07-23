import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const productions = await db.energyProduction.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(productions);
  } catch (error) {
    console.error('Failed to fetch energy production:', error);
    return NextResponse.json({ error: 'Failed to fetch energy production' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const production = await db.energyProduction.create({
      data: {
        productionId: body.productionId || `prod-${Date.now()}`,
        assetId: body.assetId,
        period: body.period || {},
        totalProduced: body.totalProduced,
        expectedProduction: body.expectedProduction || 0,
        efficiency: body.efficiency || 0,
        weather: body.weather || {},
      },
    });
    return NextResponse.json(production, { status: 201 });
  } catch (error) {
    console.error('Failed to record energy production:', error);
    return NextResponse.json({ error: 'Failed to record energy production' }, { status: 500 });
  }
}
