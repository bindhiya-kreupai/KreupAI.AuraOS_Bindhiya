import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const loans = await db.financialLoan.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(loans);
  } catch (error) {
    console.error('Failed to fetch financial loans:', error);
    return NextResponse.json({ error: 'Failed to fetch financial loans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loan = await db.financialLoan.create({
      data: {
        loanId: body.loanId || `loan-${Date.now()}`,
        customerId: body.customerId,
        customerName: body.customerName,
        loanType: body.loanType,
        status: body.status || 'active',
        principalAmount: body.principalAmount,
        currentBalance: body.currentBalance,
        interestRate: body.interestRate,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : new Date(),
        term: body.term || {},
        nextPayment: body.nextPayment || {},
        paymentHistory: body.paymentHistory || [],
        collateral: body.collateral || [],
        delinquency: body.delinquency || null,
      },
    });
    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    console.error('Failed to create financial loan:', error);
    return NextResponse.json({ error: 'Failed to create financial loan' }, { status: 500 });
  }
}
