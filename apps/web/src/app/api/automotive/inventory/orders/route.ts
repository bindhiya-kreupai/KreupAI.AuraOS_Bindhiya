import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async () => {
  try {
    const orders = await db.purchaseOrder.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Failed to fetch purchase orders:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
  }
});
