import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { meterId: string } }) {
  try {
    const meter = await db.waterMeter.findUnique({
      where: { meterId: params.meterId },
    });

    if (!meter) {
      return NextResponse.json({ error: 'Meter not found' }, { status: 404 });
    }

    return NextResponse.json(meter);
  } catch (error) {
    console.error('Failed to fetch water meter:', error);
    return NextResponse.json({ error: 'Failed to fetch water meter' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { meterId: string } }) {
  try {
    const body = await request.json();
    const meter = await db.waterMeter.update({
      where: { meterId: params.meterId },
      data: body,
    });

    return NextResponse.json(meter);
  } catch (error) {
    console.error('Failed to update water meter:', error);
    return NextResponse.json({ error: 'Failed to update water meter' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { meterId: string } }) {
  try {
    const meter = await db.waterMeter.deleteMany({
      where: { meterId: params.meterId },
    });

    return NextResponse.json(meter);
  } catch (error) {
    console.error('Failed to delete water meter:', error);
    return NextResponse.json({ error: 'Failed to delete water meter' }, { status: 500 });
  }
}
