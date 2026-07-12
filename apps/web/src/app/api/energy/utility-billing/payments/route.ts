import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const payments = await db.energyPayment.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payment = await db.energyPayment.create({
      data: {
        paymentId: body.paymentId || `pay-${Date.now()}`,
        billId: body.billId,
        accountId: body.accountId,
        amount: body.amount,
        date: body.date ? new Date(body.date) : new Date(),
        method: body.method || {},
        status: body.status || 'completed',
        reference: body.reference || `ref-${Date.now()}`,
      },
    });

    // Also update the bill status if needed
    await db.utilityBill.update({
      where: { billId: body.billId },
      data: { status: 'paid' },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Failed to record payment:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
