import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { claimId: string } }) {
  try {
    const claim = await db.insuranceClaim.findUnique({
      where: { claimId: params.claimId },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Failed to fetch claim:', error);
    return NextResponse.json({ error: 'Failed to fetch claim' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { claimId: string } }) {
  try {
    const body = await request.json();
    const claim = await db.insuranceClaim.update({
      where: { claimId: params.claimId },
      data: body,
    });

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Failed to update claim:', error);
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { claimId: string } }) {
  try {
    const claim = await db.insuranceClaim.deleteMany({
      where: { claimId: params.claimId },
    });

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Failed to delete claim:', error);
    return NextResponse.json({ error: 'Failed to delete claim' }, { status: 500 });
  }
}
