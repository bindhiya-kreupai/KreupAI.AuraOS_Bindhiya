import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const orders = await db.purchaseOrder.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Failed to fetch purchase orders:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
  }
}
