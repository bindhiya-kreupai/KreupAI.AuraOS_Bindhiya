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

    // Construct Prisma payload from the explicit form fields
    const meter = await db.waterMeter.create({
      data: {
        meterId: body.meterId || `wm-${Date.now()}`,
        type: body.type,
        status: body.status || 'active',
        location: { name: body.locationName || 'Unknown Location' },
        installationDate: new Date(body.installationDate || Date.now()),
        lastCalibration: new Date(body.lastCalibration || Date.now()),
        readings: {
          pressure: body.pressure || 60,
          flowRate: Math.floor(Math.random() * 50) + 10, // Random realistic flow rate
        },
        alerts:
          Math.random() > 0.8
            ? [
                {
                  type: 'Leak',
                  message: 'Pressure drop detected',
                  severity: 'High',
                  timestamp: new Date().toISOString(),
                },
              ]
            : [],
      },
    });

    return NextResponse.json(meter, { status: 201 });
  } catch (error) {
    console.error('Failed to create water meter:', error);
    return NextResponse.json({ error: 'Failed to create water meter' }, { status: 500 });
  }
}
