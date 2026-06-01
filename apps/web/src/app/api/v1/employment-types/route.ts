/**
 * Employment Types API
 * GET /api/v1/employment-types - List all employment types (tenant-scoped)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/v1/employment-types
 * List all employment types for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }: any) => {
  if (!permissions.includes('employment-types:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing employment-types:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    logger.info({ tenantId: user.tenantId }, 'Fetching employment types list');

    const types = await prisma.employmentType.findMany({
      where: {
        tenantId: user.tenantId,
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
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch employment types');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Internal server error',
          messageAr: 'خطأ داخلي في الخادم',
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
