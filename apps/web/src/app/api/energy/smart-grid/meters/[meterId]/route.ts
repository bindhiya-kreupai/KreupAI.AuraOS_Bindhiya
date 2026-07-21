import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { meterId: string } }) {
  try {
    const meter = await db.smartMeter.findUnique({
      where: { meterId: params.meterId },
    });

    if (!meter) {
      return NextResponse.json({ error: 'Meter not found' }, { status: 404 });
    }

    return NextResponse.json(meter);
  } catch (error) {
    console.error('Failed to fetch smart meter:', error);
    return NextResponse.json({ error: 'Failed to fetch smart meter' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { meterId: string } }) {
  try {
    const body = await request.json();
    const meter = await db.smartMeter.update({
      where: { meterId: params.meterId },
      data: body,
    });

    return NextResponse.json(meter);
  } catch (error) {
    console.error('Failed to update smart meter:', error);
    return NextResponse.json({ error: 'Failed to update smart meter' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { meterId: string } }) {
  try {
    const meter = await db.smartMeter.deleteMany({
      where: { meterId: params.meterId },
    });

    return NextResponse.json(meter);
  } catch (error) {
    console.error('Failed to delete smart meter:', error);
    return NextResponse.json({ error: 'Failed to delete smart meter' }, { status: 500 });
  }
}
