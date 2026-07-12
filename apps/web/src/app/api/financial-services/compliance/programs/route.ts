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
        programId: body.programId || `prog-${Date.now()}`,
        programName: body.programName,
        complianceArea: body.complianceArea,
        status: body.status || 'active',
        lastReviewDate: body.lastReviewDate ? new Date(body.lastReviewDate) : new Date(),
        nextReviewDate: body.nextReviewDate ? new Date(body.nextReviewDate) : new Date(),
        responsibleOfficer: body.responsibleOfficer,
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
