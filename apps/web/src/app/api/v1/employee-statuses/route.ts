/**
 * Employee Statuses API
 * GET /api/v1/employee-statuses - List all employee statuses
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/employee-statuses
 * List all employee statuses
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Fetching employee statuses list');

    const statuses = await prisma.employeeStatus.findMany({
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
          data: statuses,
          total: statuses.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, 'Failed to fetch employee statuses');

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
