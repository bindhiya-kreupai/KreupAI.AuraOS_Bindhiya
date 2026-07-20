import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { driverId: string } }) {
  try {
    const body = await request.json();

    const driver = await prisma.logisticsDriver.update({
      where: { id: params.driverId },
      data: {
        name: body.name,
        route: body.route,
        vehicle: body.vehicle,
        status: body.status,
        eta: body.eta,
        license: body.license,
      },
    });

    return NextResponse.json({ driver });
  } catch (error) {
    console.error('Update logistics driver API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
