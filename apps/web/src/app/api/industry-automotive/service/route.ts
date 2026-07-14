import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const [bays, technicians] = await Promise.all([
      prisma.automotiveServiceBay.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.automotiveServiceTechnician.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ bays, technicians });
  } catch (error) {
    console.error('Automotive service API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === 'bay') {
      const bay = await prisma.automotiveServiceBay.create({
        data: {
          name: body.name,
          status: body.status,
          car: body.car || null,
          technician: body.technician || null,
        },
      });

      return NextResponse.json({ bay }, { status: 201 });
    }

    if (body.type === 'technician') {
      const technician = await prisma.automotiveServiceTechnician.create({
        data: {
          name: body.name,
          level: body.level,
          efficiency: Number(body.efficiency),
          hours: Number(body.hours),
          status: body.status,
        },
      });

      return NextResponse.json({ technician }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid service record type' }, { status: 400 });
  } catch (error) {
    console.error('Create automotive service record error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
