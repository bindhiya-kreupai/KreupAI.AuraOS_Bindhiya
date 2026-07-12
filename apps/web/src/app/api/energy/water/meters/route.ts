import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const meters = await db.waterMeter.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(meters);
  } catch (error) {
    console.error('Failed to fetch water meters:', error);
    return NextResponse.json({ error: 'Failed to fetch water meters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const meter = await db.waterMeter.create({
      data: {
        meterId: body.meterId || `wm-${Date.now()}`,
        location: body.location || {},
        type: body.type,
        status: body.status || 'active',
        installationDate: body.installationDate ? new Date(body.installationDate) : new Date(),
        lastCalibration: body.lastCalibration ? new Date(body.lastCalibration) : new Date(),
        readings: body.readings || [],
        alerts: body.alerts || [],
      },
    });
    return NextResponse.json(meter, { status: 201 });
  } catch (error) {
    console.error('Failed to create water meter:', error);
    return NextResponse.json({ error: 'Failed to create water meter' }, { status: 500 });
  }
}
