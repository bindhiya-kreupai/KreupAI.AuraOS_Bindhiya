import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const [stocks, requisitions] = await Promise.all([
      prisma.automotivePartStock.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.automotivePartRequisition.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ stocks, requisitions });
  } catch (error) {
    console.error('Automotive parts API error:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === 'stock') {
      const stock = await prisma.automotivePartStock.create({
        data: {
          part: body.part,
          category: body.category,
          stock: Number(body.stock),
          minStock: Number(body.minStock),
          location: body.location,
          status: body.status,
        },
      });

      return NextResponse.json({ stock }, { status: 201 });
    }

    if (body.type === 'requisition') {
      const requisition = await prisma.automotivePartRequisition.create({
        data: {
          technician: body.technician,
          bay: body.bay,
          item: body.item,
          priority: body.priority,
          status: body.status || 'Pending',
        },
      });

      return NextResponse.json({ requisition }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid record type' }, { status: 400 });
  } catch (error) {
    console.error('Create automotive parts record error:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
