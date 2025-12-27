/**
 * Locations API
 * GET /api/v1/locations - List all locations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/locations
 * List all locations
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Fetching locations list');

    const locations = await prisma.location.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          data: locations,
          total: locations.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, 'Failed to fetch locations');

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
