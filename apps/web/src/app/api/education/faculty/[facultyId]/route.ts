import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET(request: NextRequest, { params }: { params: { facultyId: string } }) {
  try {
    const faculty = await prisma.educationFacultyMember.findUnique({
      where: { id: params.facultyId },
    });
    if (!faculty) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(faculty);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { facultyId: string } }) {
  try {
    const data = await request.json();
    const faculty = await prisma.educationFacultyMember.update({
      where: { id: params.facultyId },
      data,
    });
    return NextResponse.json(faculty);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
