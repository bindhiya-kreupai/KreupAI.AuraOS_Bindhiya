import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET(_request: NextRequest, { params }: { params: { industry: string } }) {
  try {
    const code = params.industry.toLowerCase();

    const industry = await prisma.industrySolution.findUnique({
      where: { code },
      select: {
        code: true,
        name: true,
        icon: true,
        description: true,
      },
    });

    if (!industry) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Unknown industry',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: industry,
    });
  } catch (error) {
    console.error('Industry detail API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5000',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
