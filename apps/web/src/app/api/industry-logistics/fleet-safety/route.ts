import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const incidents = await prisma.logisticsFleetSafety.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error('Logistics fleet safety API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const incident = await prisma.logisticsFleetSafety.create({
      data: {
        event: body.event,
        driver: body.driver,
        time: body.time,
        location: body.location,
        severity: body.severity,
        score: body.score ? Number(body.score) : null,
        trend: body.trend,
      },
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    console.error('Create logistics fleet safety API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
