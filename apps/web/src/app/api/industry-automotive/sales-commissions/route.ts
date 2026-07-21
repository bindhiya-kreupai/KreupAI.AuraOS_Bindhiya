import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const commissions = await prisma.automotiveSalesCommission.findMany({
      orderBy: {
        rank: 'asc',
      },
    });

    return NextResponse.json({ commissions });
  } catch (error) {
    console.error('Get sales commissions API error:', error);
    return NextResponse.json({ commissions: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const commission = await prisma.automotiveSalesCommission.create({
      data: {
        rank: Number(body.rank),
        salesperson: body.salesperson,
        unitsSold: Number(body.unitsSold),
        grossProfit: Number(body.grossProfit),
        commission: Number(body.commission),
      },
    });

    return NextResponse.json({ commission }, { status: 201 });
  } catch (error) {
    console.error('Create sales commission API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
