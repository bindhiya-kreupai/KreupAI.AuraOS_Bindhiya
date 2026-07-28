import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    const part = await db.part.findUnique({
      where: { partId: params.partId },
    });
    if (!part) return NextResponse.json({ error: 'Part not found' }, { status: 404 });
    const mappedPart = { ...part, partName: part.name, cost: part.costPrice };
    return NextResponse.json({ part: mappedPart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch part' }, { status: 500 });
  }
});

export const PUT = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    const body = await request.json();
    const updateData = { ...body };
    if (updateData.partName) {
      updateData.name = updateData.partName;
      delete updateData.partName;
    }
    if (updateData.cost !== undefined) {
      updateData.costPrice = updateData.cost;
      delete updateData.cost;
    }

    const part = await db.part.update({
      where: { partId: params.partId },
      data: updateData,
    });
    const mappedPart = { ...part, partName: part.name, cost: part.costPrice };
    return NextResponse.json({ part: mappedPart });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update part' }, { status: 500 });
  }
});

export const DELETE = createProtectedRoute(async (request: Request, { params }: any) => {
  try {
    await db.part.delete({
      where: { partId: params.partId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete part' }, { status: 500 });
  }
});
