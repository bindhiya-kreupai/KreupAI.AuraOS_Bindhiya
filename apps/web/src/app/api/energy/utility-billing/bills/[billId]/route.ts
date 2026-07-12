import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { billId: string } }) {
  try {
    const bill = await db.utilityBill.findUnique({
      where: { billId: params.billId },
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Failed to fetch bill:', error);
    return NextResponse.json({ error: 'Failed to fetch bill' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { billId: string } }) {
  try {
    const body = await request.json();
    const bill = await db.utilityBill.update({
      where: { billId: params.billId },
      data: body,
    });

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Failed to update bill:', error);
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
  }
}
