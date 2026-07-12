import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function POST(request: Request, { params }: { params: { meterId: string } }) {
  try {
    const body = await request.json();

    const meter = await db.smartMeter.findUnique({ where: { meterId: params.meterId } });
    if (!meter) return NextResponse.json({ error: 'Meter not found' }, { status: 404 });

    const currentAlerts = Array.isArray(meter.alerts) ? meter.alerts : [];
    const newAlerts = [...currentAlerts, { ...body, timestamp: new Date().toISOString() }];

    const updatedMeter = await db.smartMeter.update({
      where: { meterId: params.meterId },
      data: { alerts: newAlerts },
    });

    return NextResponse.json(updatedMeter);
  } catch (error) {
    console.error('Failed to add meter alert:', error);
    return NextResponse.json({ error: 'Failed to add meter alert' }, { status: 500 });
  }
}
