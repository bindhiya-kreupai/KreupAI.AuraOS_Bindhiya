/**
 * Companies API
 * GET /api/v1/companies - List all companies (tenant-scoped)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/v1/companies
 * List all companies for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }: any) => {
  if (!permissions.includes('companies:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing companies:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    logger.info({ tenantId: user.tenantId }, 'Fetching companies list');

    const companies = await prisma.company.findMany({
      where: {
        tenantId: user.tenantId,
      },
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
