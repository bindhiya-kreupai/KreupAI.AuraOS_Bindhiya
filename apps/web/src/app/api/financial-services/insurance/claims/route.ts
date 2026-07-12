import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const claims = await db.insuranceClaim.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(claims);
  } catch (error) {
    console.error('Failed to fetch insurance claims:', error);
    return NextResponse.json({ error: 'Failed to fetch insurance claims' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const claim = await db.insuranceClaim.create({
      data: {
        claimId: body.claimId || `clm-${Date.now()}`,
        policyId: body.policyId,
        claimNumber: body.claimNumber,
        status: body.status || 'submitted',
        dateOfLoss: body.dateOfLoss ? new Date(body.dateOfLoss) : new Date(),
        dateReported: body.dateReported ? new Date(body.dateReported) : new Date(),
        claimant: body.claimant || {},
        incident: body.incident || {},
        adjuster: body.adjuster || null,
        investigation: body.investigation || null,
        reserveAmount: body.reserveAmount,
        paidAmount: body.paidAmount,
        timeline: body.timeline || [],
        documents: body.documents || [],
        communications: body.communications || [],
      },
    });
    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error('Failed to create insurance claim:', error);
    return NextResponse.json({ error: 'Failed to create insurance claim' }, { status: 500 });
  }
}
