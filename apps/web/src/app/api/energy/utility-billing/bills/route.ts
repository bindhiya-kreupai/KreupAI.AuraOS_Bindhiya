import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const bills = await db.utilityBill.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Failed to fetch utility bills:', error);
    return NextResponse.json({ error: 'Failed to fetch utility bills' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Construct Prisma payload from explicit form fields
    const amount = body.amount || 0;
    const electricity = amount * 0.6;
    const water = amount * 0.25;
    const gas = amount * 0.15;

    const bill = await db.utilityBill.create({
      data: {
        billId: body.billId || `ub-${Date.now()}`,
        accountId: body.accountId || 'acc-default',
        billingCycle: { month: body.billingMonth || 'Current' },
        consumption: {},
        charges: { electricity, water, gas },
        total: { amount },
        dueDate: new Date(body.dueDate || Date.now()),
        status: body.status || 'Pending',
        paymentInfo: {},
        documents: {},
        alerts: {},
      },
    });
    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Failed to create utility bill:', error);
    return NextResponse.json({ error: 'Failed to create utility bill' }, { status: 500 });
  }
}
