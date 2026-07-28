import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const accounts = await db.financialAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to fetch financial accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch financial accounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const account = await db.financialAccount.create({
      data: {
        accountId: body.accountId || `acc-${Date.now()}`,
        accountNumber: body.accountNumber,
        accountType: body.accountType,
        customerId: body.customerId,
        customerName: body.customerName,
        balance: body.balance || { currency: 'USD', amount: 0 },
        status: body.status || 'active',
        openDate: body.openDate ? new Date(body.openDate) : new Date(),
        closedDate: body.closedDate ? new Date(body.closedDate) : null,
        interestRate: body.interestRate,
        minimumBalance: body.minimumBalance,
        fees: body.fees || [],
        features: body.features || [],
        linkedAccounts: body.linkedAccounts || [],
        alerts: body.alerts || [],
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Failed to create financial account:', error);
    return NextResponse.json({ error: 'Failed to create financial account' }, { status: 500 });
  }
}
