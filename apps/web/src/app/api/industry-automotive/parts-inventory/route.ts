import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const parts = await prisma.automotivePartInventory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ parts });
  } catch (error) {
    console.error('Get automotive parts API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const part = await prisma.automotivePartInventory.create({
      data: {
        part: body.part,
        sku: body.sku,
        stock: Number(body.stock),
        minStock: Number(body.minStock),
        status: body.status,
        supplier: body.supplier,
      },
    });

    return NextResponse.json({ part }, { status: 201 });
  } catch (error) {
    console.error('Create automotive part API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
