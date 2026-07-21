import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const cycles = await prisma.agricultureCropCycle.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ cycles });
  } catch (error) {
    console.error('Agriculture crop cycles API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const cycle = await prisma.agricultureCropCycle.create({
      data: {
        crop: body.crop,
        field: body.field,
        stage: body.stage,
        harvest: body.harvest,
        progress: Number(body.progress),
      },
    });

    return NextResponse.json({ cycle }, { status: 201 });
  } catch (error) {
    console.error('Create agriculture crop cycle API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
