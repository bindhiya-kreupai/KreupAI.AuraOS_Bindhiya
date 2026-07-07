import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const drivers = await prisma.logisticsDriver.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error('Logistics drivers API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const driver = await prisma.logisticsDriver.create({
      data: {
        name: body.name,
        route: body.route,
        vehicle: body.vehicle,
        status: body.status,
        eta: body.eta,
        license: body.license,
      },
    });

    return NextResponse.json({ driver }, { status: 201 });
  } catch (error) {
    console.error('Create logistics driver API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
