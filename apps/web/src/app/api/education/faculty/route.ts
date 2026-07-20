import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    let whereClause = {};
    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const faculty = await prisma.educationFacultyMember.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(faculty);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch faculty' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.joinDate) data.joinDate = new Date().toISOString();
    const faculty = await prisma.educationFacultyMember.create({ data });
    return NextResponse.json(faculty, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create faculty' }, { status: 500 });
  }
}
