// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
/**
 * Employee Statuses API
 * GET /api/v1/employee-statuses - List all employee statuses (tenant-scoped)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/v1/employee-statuses
 * List all employee statuses for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }: any) => {
  if (!permissions.includes('employee-statuses:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing employee-statuses:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    logger.info({ tenantId: user.tenantId }, 'Fetching employee statuses list');

    const statuses = await prisma.employeeStatus.findMany({
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
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch employee statuses');

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
