import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const programs = await db.complianceProgram.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Failed to fetch compliance programs:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance programs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const program = await db.complianceProgram.create({
      data: {
        programId: body.programId || `CP-${Date.now()}`,
        programName: body.programName || 'Standard Compliance Program',
        complianceArea: body.complianceArea || 'General',
        status: body.status || 'Active',
        lastReviewDate: new Date(body.lastReviewDate || Date.now()),
        nextReviewDate: new Date(body.nextReviewDate || Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        responsibleOfficer: body.responsibleOfficer || 'Unassigned',
        policies: body.policies || [],
        procedures: body.procedures || [],
        controls: body.controls || [],
        training: body.training || [],
        audits: body.audits || [],
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Failed to create compliance program:', error);
    return NextResponse.json({ error: 'Failed to create compliance program' }, { status: 500 });
  }
}
