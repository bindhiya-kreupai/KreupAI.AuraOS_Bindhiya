import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const portfolios = await db.wealthPortfolio.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Failed to fetch portfolios:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const assetAllocation = body.assetAllocation || [
      { assetClass: 'Equities', percentage: 60 },
      { assetClass: 'Fixed Income', percentage: 30 },
      { assetClass: 'Cash', percentage: 10 },
    ];

    const riskProfile = body.riskProfile || {
      tolerance: 'Moderate',
      objective: 'Growth',
      timeHorizon: 'Long-term',
    };

    const holdings = body.holdings || [];

    const totalValue = body.totalValue ? parseFloat(body.totalValue) : 0;
    const cashBalance = body.cashBalance ? parseFloat(body.cashBalance) : totalValue * 0.1;

    const portfolio = await db.wealthPortfolio.create({
      data: {
        portfolioId: body.portfolioId || `PRT-${Date.now()}`,
        clientId: body.clientId || 'CLIENT-DEFAULT',
        clientName: body.clientName || 'John Doe',
        portfolioType: body.portfolioType || 'Standard',
        status: body.status || 'Active',
        totalValue,
        cashBalance,
        currency: body.currency || 'USD',
        advisor: body.advisor || { name: 'Unassigned' },
        assetAllocation,
        holdings,
        performance: body.performance || { ytdReturn: 0, sinceInception: 0 },
        riskProfile,
        taxInfo: body.taxInfo || { taxLossHarvesting: false },
      },
    });

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error('Failed to create portfolio:', error);
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
  }
}
