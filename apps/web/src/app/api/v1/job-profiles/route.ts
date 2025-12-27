/**
 * Job Profiles API
 * GET /api/v1/job-profiles - List all job profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/job-profiles
 * List all job profiles
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Fetching job profiles list');

    const jobProfiles = await prisma.jobProfile.findMany({
      where: {
        status: 'Active',
      },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        family: {
          select: {
            name: true,
          },
        },
        grade: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          data: jobProfiles,
          total: jobProfiles.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, 'Failed to fetch job profiles');

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
