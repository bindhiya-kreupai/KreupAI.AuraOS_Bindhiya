import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { accountId: string } }) {
  try {
    const account = await db.utilityAccount.findUnique({
      where: { accountId: params.accountId },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Failed to fetch account:', error);
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { accountId: string } }) {
  try {
    const body = await request.json();
    const account = await db.utilityAccount.update({
      where: { accountId: params.accountId },
      data: body,
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Failed to update account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}
