import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function POST(request: Request, { params }: { params: { meterId: string } }) {
  try {
    const body = await request.json();

    const meter = await db.smartMeter.findUnique({ where: { meterId: params.meterId } });
    if (!meter) return NextResponse.json({ error: 'Meter not found' }, { status: 404 });

    const currentReadings = Array.isArray(meter.readings) ? meter.readings : [];
    const newReadings = [...currentReadings, { ...body, timestamp: new Date().toISOString() }];

    const updatedMeter = await db.smartMeter.update({
      where: { meterId: params.meterId },
      data: { readings: newReadings },
    });

    return NextResponse.json(updatedMeter);
  } catch (error) {
    console.error('Failed to add meter reading:', error);
    return NextResponse.json({ error: 'Failed to add meter reading' }, { status: 500 });
  }
}
