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
    const bill = await db.utilityBill.create({
      data: {
        billId: body.billId || `bill-${Date.now()}`,
        accountId: body.accountId,
        billingCycle: body.billingCycle || {},
        consumption: body.consumption || {},
        charges: body.charges || {},
        total: body.total || {},
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
        status: body.status || 'unpaid',
        paymentInfo: body.paymentInfo || {},
        documents: body.documents || [],
        alerts: body.alerts || [],
      },
    });
    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Failed to create utility bill:', error);
    return NextResponse.json({ error: 'Failed to create utility bill' }, { status: 500 });
  }
}
