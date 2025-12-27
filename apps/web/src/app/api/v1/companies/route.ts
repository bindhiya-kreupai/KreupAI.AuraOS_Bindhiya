/**
 * Companies API
 * GET /api/v1/companies - List all companies
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/companies
 * List all companies
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Fetching companies list');

    // TODO: Add tenant filtering from auth context
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        taxId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          data: companies,
          total: companies.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, 'Failed to fetch companies');

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
