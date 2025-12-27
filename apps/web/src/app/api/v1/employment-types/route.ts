/**
 * Employment Types API
 * GET /api/v1/employment-types - List all employment types
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/employment-types
 * List all employment types
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Fetching employment types list');

    const types = await prisma.employmentType.findMany({
      where: {
        status: 'Active',
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          data: types,
          total: types.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, 'Failed to fetch employment types');

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
