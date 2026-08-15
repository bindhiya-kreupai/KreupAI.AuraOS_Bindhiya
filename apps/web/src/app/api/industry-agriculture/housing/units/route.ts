import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const units = await prisma.agricultureHousingUnit.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ units });
  } catch (error) {
    console.error('Agriculture housing units API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const unit = await prisma.agricultureHousingUnit.create({
      data: {
        unit: body.unit,
        occupied: Number(body.occupied),
        capacity: Number(body.capacity),
        status: body.status,
        type: body.type,
      },
    });

    return NextResponse.json({ unit }, { status: 201 });
  } catch (error) {
    console.error('Create agriculture housing unit API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
