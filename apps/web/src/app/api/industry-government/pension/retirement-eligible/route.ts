import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const pensions = await db.pensionScheme.findMany({
      where: {
        yearsOfService: {
          gte: 20,
        },
      },
      orderBy: { yearsOfService: 'desc' },
    });

    return NextResponse.json({ pensions });
  } catch (error) {
    console.error('Failed to fetch retirement eligible pensions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retirement eligible pensions' },
      { status: 500 }
    );
  }
}
