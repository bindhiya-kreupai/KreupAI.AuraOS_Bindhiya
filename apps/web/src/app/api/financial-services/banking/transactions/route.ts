import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    const where = accountId ? { accountId } : {};

    const transactions = await db.financialTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Failed to fetch financial transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch financial transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transaction = await db.financialTransaction.create({
      data: {
        transactionId: body.transactionId || `txn-${Date.now()}`,
        accountId: body.accountId,
        accountName: body.accountName || 'Unknown Account',
        type: body.type || 'debit',
        amount: body.amount,
        currency: body.currency || 'USD',
        status: body.status || 'completed',
        date: body.date ? new Date(body.date) : new Date(),
        description: body.description || '',
        category: body.category || 'other',
        merchant: body.merchant,
        location: body.location || null,
        metadata: body.metadata || null,
        reference: body.reference || null,
      },
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Failed to create financial transaction:', error);
    return NextResponse.json({ error: 'Failed to create financial transaction' }, { status: 500 });
  }
}
