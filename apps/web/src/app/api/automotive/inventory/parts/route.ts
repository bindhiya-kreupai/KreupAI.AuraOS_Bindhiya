import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const parts = await db.part.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ parts });
  } catch (error) {
    console.error('Failed to fetch parts:', error);
    return NextResponse.json({ error: 'Failed to fetch parts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const part = await db.part.create({
      data: {
        partId: body.partId || `part-${Date.now()}`,
        partNumber: body.partNumber,
        name: body.name,
        description: body.description || '',
        category: body.category,
        manufacturer: body.manufacturer,
        costPrice: body.costPrice,
        retailPrice: body.retailPrice,
        quantityOnHand: body.quantityOnHand || 0,
        reorderPoint: body.reorderPoint || 0,
        reorderQuantity: body.reorderQuantity || 0,
        location: body.location || {},
        applicableVehicles: body.applicableVehicles || [],
        suppliers: body.suppliers || [],
        status: body.status || 'active',
      },
    });
    return NextResponse.json({ part }, { status: 201 });
  } catch (error) {
    console.error('Failed to create part:', error);
    return NextResponse.json({ error: 'Failed to create part' }, { status: 500 });
  }
}
