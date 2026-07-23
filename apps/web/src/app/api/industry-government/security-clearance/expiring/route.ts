import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90', 10);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const clearances = await db.securityClearance.findMany({
      where: {
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return NextResponse.json({ clearances });
  } catch (error) {
    console.error('Failed to fetch expiring security clearances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expiring security clearances' },
      { status: 500 }
    );
  }
}
