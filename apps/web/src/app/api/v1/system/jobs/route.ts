import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { queueService } from '@/lib/queue/queue.service';
import { jobScheduler } from '@/lib/queue/scheduler';
import { QUEUE_NAMES } from '@/lib/queue/rabbitmq';

// API Response Standard
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

/**
 * GET /api/v1/system/jobs
 * Get job monitoring dashboard with queue stats and scheduled jobs
 *
 * Query Parameters:
 * - type (optional): 'queues' | 'scheduled' | 'all' (default: 'all')
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('system:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing system:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const jobData: any = {};

    // Queue Statistics
    if (type === 'all' || type === 'queues') {
      const queueStats = await Promise.all(
        Object.values(QUEUE_NAMES).map(async (queue) => {
          const stats = await queueService.getQueueStats(queue);
          return {
            name: queue,
            messageCount: stats?.messageCount || 0,
            consumerCount: stats?.consumerCount || 0,
            status: stats ? 'ACTIVE' : 'UNAVAILABLE',
          };
        })
      );

      const totalPending = queueStats.reduce((sum, q) => sum + q.messageCount, 0);
      const totalConsumers = queueStats.reduce((sum, q) => sum + q.consumerCount, 0);

      jobData.queues = {
        summary: {
          totalQueues: queueStats.length,
          totalPendingJobs: totalPending,
          totalActiveConsumers: totalConsumers,
          status: queueStats.some((q) => q.status === 'ACTIVE') ? 'OPERATIONAL' : 'DEGRADED',
        },
        queues: queueStats,
      };
    }

    // Scheduled Jobs
    if (type === 'all' || type === 'scheduled') {
      const scheduledJobs = jobScheduler.getJobs();

      const enabledCount = scheduledJobs.filter((j) => j.enabled).length;
      const disabledCount = scheduledJobs.filter((j) => !j.enabled).length;

      jobData.scheduled = {
        summary: {
          totalJobs: scheduledJobs.length,
          enabledJobs: enabledCount,
          disabledJobs: disabledCount,
        },
        jobs: scheduledJobs.map((job) => ({
          id: job.id,
          name: job.name,
          cronExpression: job.cronExpression,
          enabled: job.enabled,
          lastRun: job.lastRun || null,
          queue: job.queue,
          jobType: job.jobType,
        })),
      };
    }

    const response: ApiResponse = {
      success: true,
      data: {
        ...jobData,
        generatedAt: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Jobs API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch job information',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});
