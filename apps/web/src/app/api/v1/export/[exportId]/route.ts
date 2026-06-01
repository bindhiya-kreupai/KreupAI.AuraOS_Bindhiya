/**
 * Export Status API
 * GET /api/v1/export/{exportId} - Get export status
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { queueService } from '@/lib/queue/queue.service';
import { logger } from '@/lib/logger';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/v1/export/{exportId}
 * Get export job status
 */
async function handleGET(
  request: NextRequest,
  { params }: { params: { exportId: string } }
): Promise<NextResponse> {
  try {
    const { exportId } = params;

    logger.info({ exportId }, 'Fetching export status');

    // Get job status from queue service
    const jobStatus = await queueService.getJobStatus(exportId);

    if (!jobStatus) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3001',
            message: 'Export job not found',
            details: { exportId },
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          exportId,
          status: jobStatus.status,
          result: jobStatus.result,
          error: jobStatus.error,
          createdAt: jobStatus.createdAt,
          updatedAt: jobStatus.updatedAt,
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error({ error, exportId: params.exportId }, 'Failed to fetch export status');

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

export const GET = withAuth(handleGET);
