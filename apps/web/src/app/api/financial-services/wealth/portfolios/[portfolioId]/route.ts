import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { portfolioId: string } }) {
  try {
    const portfolio = await db.wealthPortfolio.findUnique({
      where: { portfolioId: params.portfolioId },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { portfolioId: string } }) {
  try {
    const body = await request.json();
    const portfolio = await db.wealthPortfolio.update({
      where: { portfolioId: params.portfolioId },
      data: body,
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { portfolioId: string } }) {
  try {
    const portfolio = await db.wealthPortfolio.deleteMany({
      where: { portfolioId: params.portfolioId },
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}
