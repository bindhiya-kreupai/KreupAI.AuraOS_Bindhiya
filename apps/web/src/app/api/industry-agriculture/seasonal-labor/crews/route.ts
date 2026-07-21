import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const crews = await prisma.agricultureSeasonalCrew.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ crews });
  } catch (error) {
    console.error('Agriculture seasonal crews API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const crew = await prisma.agricultureSeasonalCrew.create({
      data: {
        name: body.name,
        location: body.location,
        size: Number(body.size),
        origin: body.origin,
        status: body.status,
      },
    });

    return NextResponse.json({ crew }, { status: 201 });
  } catch (error) {
    console.error('Create agriculture seasonal crew API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
