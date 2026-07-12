import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function PUT(request: Request, { params }: { params: { portfolioId: string } }) {
  try {
    const body = await request.json();

    const portfolio = await db.wealthPortfolio.update({
      where: { portfolioId: params.portfolioId },
      data: body,
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Failed to update wealth portfolio:', error);
    return NextResponse.json({ error: 'Failed to update wealth portfolio' }, { status: 500 });
  }
}
