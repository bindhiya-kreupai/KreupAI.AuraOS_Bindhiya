import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const orders = await db.wealthTradeOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch wealth trade orders:', error);
    return NextResponse.json({ error: 'Failed to fetch wealth trade orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await db.wealthTradeOrder.create({
      data: {
        orderId: body.orderId || `ord-${Date.now()}`,
        portfolioId: body.portfolioId,
        ticker: body.ticker,
        assetClass: body.assetClass,
        orderType: body.orderType,
        action: body.action,
        quantity: body.quantity,
        limitPrice: body.limitPrice,
        status: body.status || 'pending',
        submittedAt: body.submittedAt ? new Date(body.submittedAt) : new Date(),
        executedAt: body.executedAt ? new Date(body.executedAt) : null,
        executionPrice: body.executionPrice,
        fees: body.fees,
      },
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Failed to create wealth trade order:', error);
    return NextResponse.json({ error: 'Failed to create wealth trade order' }, { status: 500 });
  }
}
