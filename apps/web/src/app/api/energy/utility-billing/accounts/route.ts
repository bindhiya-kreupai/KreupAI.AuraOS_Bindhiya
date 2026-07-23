import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const accounts = await db.utilityAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to fetch utility accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch utility accounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const account = await db.utilityAccount.create({
      data: {
        accountId: body.accountId || `acc-${Date.now()}`,
        provider: body.provider || {},
        accountNumber: body.accountNumber,
        serviceAddress: body.serviceAddress || {},
        rateSchedule: body.rateSchedule || {},
        status: body.status || 'active',
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Failed to create utility account:', error);
    return NextResponse.json({ error: 'Failed to create utility account' }, { status: 500 });
  }
}
