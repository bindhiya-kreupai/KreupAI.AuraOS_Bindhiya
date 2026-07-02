import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Job Functions API — read-only reference list used to populate the
 * "function" dropdown when creating a job family. JobFunction is a shared
 * configuration catalog table (no tenantId column).
 */

export const GET = withEnhancedAuth(async (_request: NextRequest) => {
  try {
    // tenant-ok: JobFunction is a shared configuration catalog (no tenantId column)
    const functions = await prisma.jobFunction.findMany({
      where: { isDeleted: false },
      select: { id: true, code: true, name: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        items: functions,
        total: functions.length,
        page: 1,
        pageSize: functions.length,
        hasNextPage: false,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching job functions');
    return NextResponse.json(
      {
        error: 'Failed to fetch job functions',
        message: 'Failed to fetch job functions',
        messageAr: 'فشل في جلب الوظائف الرئيسية',
      },
      { status: 500 }
    );
  }
});
