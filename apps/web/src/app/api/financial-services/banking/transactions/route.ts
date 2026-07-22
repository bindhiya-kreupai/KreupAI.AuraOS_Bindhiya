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

    // Dynamic generation
    const amount = body.amount ? parseFloat(body.amount) : 0;
    const type = body.type || (amount >= 0 ? 'deposit' : 'withdrawal');
    const category = body.category || (type === 'deposit' ? 'Income' : 'Expense');

    const transaction = await db.financialTransaction.create({
      data: {
        transactionId: body.transactionId || `TXN-${Date.now()}`,
        accountId: body.accountId || 'acc-default',
        accountName: body.accountName || 'Primary Account',
        type,
        amount,
        currency: body.currency || 'USD',
        status: body.status || 'completed',
        date: body.date ? new Date(body.date) : new Date(),
        description: body.description || `${type} Transaction`,
        category,
        merchant: body.merchant || 'Internal Transfer',
        location: body.location || {},
        metadata: body.metadata || {},
        reference: body.reference || `REF-${Math.floor(Math.random() * 10000)}`,
      },
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Failed to create financial transaction:', error);
    return NextResponse.json({ error: 'Failed to create financial transaction' }, { status: 500 });
  }
}
