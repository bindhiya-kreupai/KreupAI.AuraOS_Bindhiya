import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const consumptions = await db.energyConsumption.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(consumptions);
  } catch (error) {
    console.error('Failed to fetch energy consumption:', error);
    return NextResponse.json({ error: 'Failed to fetch energy consumption' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const consumption = await db.energyConsumption.create({
      data: {
        consumptionId: body.consumptionId || `cons-${Date.now()}`,
        facilityId: body.facilityId,
        period: body.period || {},
        totalConsumption: body.totalConsumption,
        peakDemand: body.peakDemand,
        breakdown: body.breakdown || {},
        departmentConsumption: body.departmentConsumption || {},
        equipmentConsumption: body.equipmentConsumption || {},
        comparison: body.comparison || {},
      },
    });
    return NextResponse.json(consumption, { status: 201 });
  } catch (error) {
    console.error('Failed to record energy consumption:', error);
    return NextResponse.json({ error: 'Failed to record energy consumption' }, { status: 500 });
  }
}
