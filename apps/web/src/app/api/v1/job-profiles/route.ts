/**
 * Job Profiles API
 * GET /api/v1/job-profiles - List all job profiles (tenant-scoped)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/v1/job-profiles
 * List all job profiles for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }: any) => {
  if (!permissions.includes('job-profiles:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing job-profiles:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    logger.info({ tenantId: user.tenantId }, 'Fetching job profiles list');

    const jobProfiles = await prisma.jobProfile.findMany({
      where: {
        tenantId: user.tenantId,
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
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch job profiles');

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
