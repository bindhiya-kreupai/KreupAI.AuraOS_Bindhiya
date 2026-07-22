import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(request: Request, { params }: { params: { programId: string } }) {
  try {
    const program = await db.complianceProgram.findUnique({
      where: { programId: params.programId },
    });

    if (!program) {
      return NextResponse.json({ error: 'Compliance program not found' }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Failed to fetch compliance program:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance program' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { programId: string } }) {
  try {
    const body = await request.json();
    const program = await db.complianceProgram.update({
      where: { programId: params.programId },
      data: body,
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('Failed to update compliance program:', error);
    return NextResponse.json({ error: 'Failed to update compliance program' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { programId: string } }) {
  try {
    const program = await db.complianceProgram.deleteMany({
      where: { programId: params.programId },
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('Failed to delete compliance program:', error);
    return NextResponse.json({ error: 'Failed to delete compliance program' }, { status: 500 });
  }
}
