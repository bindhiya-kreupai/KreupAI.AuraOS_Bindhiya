import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const claims = await db.insuranceClaim.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(claims);
  } catch (error) {
    console.error('Failed to fetch claims:', error);
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const incident = body.incident || {
      description: 'Default Incident Description',
      location: 'Unspecified',
      severity: 'Low',
      policeReport: false,
    };

    const claimant = body.claimant || {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john.doe@example.com',
    };

    const timeline = body.timeline || [
      { status: 'Claim Filed', date: new Date().toISOString(), notes: 'Initial submission' },
    ];

    const claim = await db.insuranceClaim.create({
      data: {
        claimId: body.claimId || `CLM-${Date.now()}`,
        policyId: body.policyId || 'POL-DEFAULT',
        claimNumber: body.claimNumber || `CN-${Math.floor(Math.random() * 100000)}`,
        status: body.status || 'Pending',
        dateOfLoss: new Date(body.dateOfLoss || Date.now()),
        dateReported: new Date(body.dateReported || Date.now()),
        claimant,
        incident,
        adjuster: body.adjuster || null,
        investigation: body.investigation || { status: 'Not Started' },
        reserveAmount: body.reserveAmount || 10000,
        paidAmount: body.paidAmount || 0,
        timeline,
        documents: body.documents || [],
        communications: body.communications || [],
      },
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error('Failed to create claim:', error);
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 });
  }
}
