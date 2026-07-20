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
          { title: { contains: search, mode: 'insensitive' } },
          { fundingAgency: { contains: search, mode: 'insensitive' } },
          { status: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const grants = await prisma.educationResearchGrant.findMany({
      where: whereClause,
    });
    return NextResponse.json(grants);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const grant = await prisma.educationResearchGrant.create({ data });
    return NextResponse.json(grant, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
