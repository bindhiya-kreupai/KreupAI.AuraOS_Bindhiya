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
    return NextResponse.json(
      {
        error: 'Failed to fetch smart meters',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Construct Prisma payload from the explicit form fields
    const meter = await db.smartMeter.create({
      data: {
        facilityId: body.facilityId || null,
        meterId: body.meterId || `sm-${Date.now()}`,
        type: body.type,
        status: body.status,
        location: {
          facilityId: body.locationFacilityId,
          facilityName: body.locationFacilityName,
        },
        installationDate: body.installationDate ? new Date(body.installationDate) : new Date(),
        manufacturer: body.manufacturer,
        model: body.model,
        firmwareVersion: body.firmwareVersion,
        connectivity: body.connectivity,
        interval: body.interval ? Number(body.interval) : null,
        lastCalibration: body.lastCalibration ? new Date(body.lastCalibration) : new Date(),
        lastReading: {
          unit: body.readingUnit,
          value: body.readingValue,
          source: body.readingSource || 'manual',
          quality: body.readingQuality || 'good',
          readingId: body.readingId || crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
        readings: { load: body.initialLoad || 0, temp: body.initialTemp || 0 },
        alerts: [],
        createdBy: body.createdBy || 'USR-001',
      },
    });

    return NextResponse.json(meter, { status: 201 });
  } catch (error) {
    console.error('Failed to create smart meter:', error);
    return NextResponse.json(
      {
        error: 'Failed to create smart meter',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
