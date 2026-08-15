import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET(request: NextRequest, { params }: { params: { adjunctId: string } }) {
  try {
    const adjunct = await prisma.educationAdjunctFaculty.findUnique({
      where: { id: params.adjunctId },
    });
    if (!adjunct) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(adjunct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { adjunctId: string } }) {
  try {
    const data = await request.json();
    const adjunct = await prisma.educationAdjunctFaculty.update({
      where: { id: params.adjunctId },
      data,
    });
    return NextResponse.json(adjunct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { adjunctId: string } }) {
  try {
    const adjunct = await prisma.educationAdjunctFaculty.delete({
      where: { id: params.adjunctId },
    });
    return NextResponse.json(adjunct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
