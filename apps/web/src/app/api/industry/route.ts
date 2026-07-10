import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
  try {
    const industries = await prisma.industrySolution.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        code: true,
        name: true,
        icon: true,
        description: true,
      },
    });

    return NextResponse.json({
      industries,
      total: industries.length,
    });
  } catch (error) {
    console.error('Industry list API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
