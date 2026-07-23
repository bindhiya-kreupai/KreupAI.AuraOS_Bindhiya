import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async () => {
  try {
    const parts = await db.part.findMany({
      orderBy: { name: 'asc' },
    });
    const mappedParts = parts.map((p) => ({
      ...p,
      partName: p.name,
      cost: p.costPrice,
    }));
    return NextResponse.json({ parts: mappedParts });
  } catch (error) {
    console.error('Failed to fetch parts:', error);
    return NextResponse.json({ error: 'Failed to fetch parts' }, { status: 500 });
  }
});

export const POST = createProtectedRoute(async (request: Request) => {
  try {
    const body = await request.json();
    const part = await db.part.create({
      data: {
        partId: body.partId || `part-${Date.now()}`,
        partNumber: body.partNumber,
        name: body.partName || body.name,
        description: body.description || '',
        category: body.category,
        manufacturer: body.manufacturer || '',
        costPrice: body.cost || body.costPrice || 0,
        retailPrice: body.retailPrice || 0,
        quantityOnHand: body.quantityOnHand || 0,
        reorderPoint: body.reorderPoint || 0,
        reorderQuantity: body.reorderQuantity || 0,
        location: body.location || { binLocation: body.binLocation || 'A-1-1' },
        applicableVehicles: body.applicableVehicles || [],
        suppliers: body.suppliers || [],
        status: body.status || 'active',
      },
    });
    const mappedPart = {
      ...part,
      partName: part.name,
      cost: part.costPrice,
    };
    return NextResponse.json({ part: mappedPart }, { status: 201 });
  } catch (error) {
    console.error('Failed to create part:', error);
    return NextResponse.json({ error: 'Failed to create part' }, { status: 500 });
  }
});
