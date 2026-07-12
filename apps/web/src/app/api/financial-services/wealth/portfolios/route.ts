import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const portfolios = await db.wealthPortfolio.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Failed to fetch wealth portfolios:', error);
    return NextResponse.json({ error: 'Failed to fetch wealth portfolios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const portfolio = await db.wealthPortfolio.create({
      data: {
        portfolioId: body.portfolioId || `port-${Date.now()}`,
        clientId: body.clientId,
        clientName: body.clientName,
        portfolioType: body.portfolioType,
        status: body.status || 'active',
        totalValue: body.totalValue || 0,
        cashBalance: body.cashBalance || 0,
        currency: body.currency || 'USD',
        advisor: body.advisor || null,
        assetAllocation: body.assetAllocation || [],
        holdings: body.holdings || [],
        performance: body.performance || null,
        riskProfile: body.riskProfile || null,
        taxInfo: body.taxInfo || null,
      },
    });
    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error('Failed to create wealth portfolio:', error);
    return NextResponse.json({ error: 'Failed to create wealth portfolio' }, { status: 500 });
  }
}
