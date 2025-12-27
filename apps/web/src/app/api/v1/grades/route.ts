/**
 * Grades API
 * GET /api/v1/grades - List all grades
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/grades
 * List all grades
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Fetching grades list');

    const grades = await prisma.grade.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        level: true,
      },
      orderBy: {
        level: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          data: grades,
          total: grades.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, 'Failed to fetch grades');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Internal server error',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
}
