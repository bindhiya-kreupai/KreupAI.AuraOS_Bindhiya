import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const meters = await db.smartMeter.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(meters);
  } catch (error) {
    console.error('Failed to fetch smart meters:', error);
    return NextResponse.json({ error: 'Failed to fetch smart meters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const meter = await db.smartMeter.create({
      data: {
        meterId: body.meterId || `sm-${Date.now()}`,
        location: body.location || {},
        type: body.type,
        status: body.status || 'active',
        installationDate: body.installationDate ? new Date(body.installationDate) : new Date(),
        lastCalibration: body.lastCalibration ? new Date(body.lastCalibration) : new Date(),
        firmwareVersion: body.firmwareVersion || '1.0.0',
        readings: body.readings || [],
        alerts: body.alerts || [],
      },
    });
    return NextResponse.json(meter, { status: 201 });
  } catch (error) {
    console.error('Failed to create smart meter:', error);
    return NextResponse.json({ error: 'Failed to create smart meter' }, { status: 500 });
  }
}
