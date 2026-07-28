import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { accountId: string } }) {
  try {
    const account = await db.financialAccount.findUnique({
      where: { accountId: params.accountId },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Failed to fetch financial account:', error);
    return NextResponse.json({ error: 'Failed to fetch financial account' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { accountId: string } }) {
  try {
    const body = await request.json();

    // Convert date strings to Date objects if they exist
    const updateData = { ...body };
    if (updateData.openDate) updateData.openDate = new Date(updateData.openDate);
    if (updateData.closedDate) updateData.closedDate = new Date(updateData.closedDate);

    const account = await db.financialAccount.update({
      where: { accountId: params.accountId },
      data: updateData,
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Failed to update financial account:', error);
    return NextResponse.json({ error: 'Failed to update financial account' }, { status: 500 });
  }
}
