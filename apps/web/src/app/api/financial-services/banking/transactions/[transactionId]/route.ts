import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { transactionId: string } }) {
  try {
    const transaction = await db.financialTransaction.findUnique({
      where: { transactionId: params.transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { transactionId: string } }) {
  try {
    const body = await request.json();
    const transaction = await db.financialTransaction.update({
      where: { transactionId: params.transactionId },
      data: body,
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { transactionId: string } }) {
  try {
    const transaction = await db.financialTransaction.deleteMany({
      where: { transactionId: params.transactionId },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
