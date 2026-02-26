import { Worker, Job, Queue } from 'bullmq';
import { MetricsService, MetricsQuery, AggregatedMetrics } from '../services/metricsService';
import { prisma } from '../lib/prisma';

export interface MetricsAggregationJobData {
  organizationId: string;
  tenantId?: string;
  departmentId?: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

export interface MetricsAggregationResult {
  organizationId: string;
  period: string;
  metricsCount: number;
  duration: number;
  cachedUntil: string;
  cacheKey?: string;
}

const QUEUE_NAME = 'metrics-aggregation';

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

// TTL map by period (milliseconds)
const CACHE_TTL_MS: Record<string, number> = {
  daily: 3_600_000,        // 1 hour
  weekly: 86_400_000,      // 24 hours
  monthly: 604_800_000,    // 7 days
};

/**
 * Start the periodic metrics aggregation worker.
 *
 * Wired to real DB operations:
 *  - Queries Employee and EmploymentHistory tables for headcount, turnover, diversity
 *  - Stores aggregated results in AnalyticsCache with TTL based on period
 *  - On failure, logs the error and returns a failed result (non-fatal cache miss)
 */
export async function startMetricsAggregationWorker(): Promise<Worker<MetricsAggregationJobData, MetricsAggregationResult>> {
  const metricsService = new MetricsService();

  const worker = new Worker<MetricsAggregationJobData, MetricsAggregationResult>(
    QUEUE_NAME,
    async (job: Job<MetricsAggregationJobData>): Promise<MetricsAggregationResult> => {
      const {
        organizationId,
        tenantId = organizationId,
        departmentId,
        period,
        startDate,
        endDate,
      } = job.data;

      const startTime = Date.now();
      job.log(`Starting metrics aggregation for org ${organizationId} period ${period} [${startDate} → ${endDate}]`);

      await job.updateProgress(10);

      const query: MetricsQuery = {
        organizationId,
        departmentId,
        startDate,
        endDate,
        granularity: period === 'daily' ? 'daily' : period === 'weekly' ? 'weekly' : 'monthly',
      };

      let metrics: AggregatedMetrics;
      try {
        metrics = await metricsService.getAllMetrics(query);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        job.log(`[ERROR] Metrics aggregation failed: ${msg}`);
        throw err; // Let BullMQ handle retry
      }

      await job.updateProgress(80);

      const duration = Date.now() - startTime;
      const ttlMs = CACHE_TTL_MS[period] ?? CACHE_TTL_MS.daily;
      const expiresAt = new Date(Date.now() + ttlMs);
      const cacheKey = `metrics:${organizationId}:${period}:${startDate}:${endDate}${departmentId ? `:${departmentId}` : ''}`;

      // ------------------------------------------------------------------ //
      // Persist aggregated metrics to AnalyticsCache                        //
      // ------------------------------------------------------------------ //
      try {
        await prisma.analyticsCache.upsert({
          where: { tenantId_cacheKey: { tenantId, cacheKey } },
          update: {
            data: metrics as unknown as Record<string, unknown>,
            generatedAt: new Date(),
            expiresAt,
            recordCount: metrics.headcount.total,
          },
          create: {
            tenantId,
            cacheKey,
            category: 'ANALYTICS',
            data: metrics as unknown as Record<string, unknown>,
            generatedAt: new Date(),
            expiresAt,
            recordCount: metrics.headcount.total,
          },
        });
        job.log(`Metrics cached at key: ${cacheKey} expires: ${expiresAt.toISOString()}`);
      } catch (cacheErr) {
        // Non-fatal: log and continue — cache miss is acceptable
        job.log(
          `[WARN] Could not write AnalyticsCache: ${cacheErr instanceof Error ? cacheErr.message : String(cacheErr)}`
        );
      }

      await job.updateProgress(100);

      return {
        organizationId,
        period,
        metricsCount: 3, // headcount, turnover, diversity
        duration,
        cachedUntil: expiresAt.toISOString(),
        cacheKey,
      };
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 5,
    }
  );

  worker.on('completed', (job, result) => {
    console.log(
      `Metrics aggregation completed: ${job.id} org: ${result.organizationId} period: ${result.period} duration: ${result.duration}ms`
    );
  });

  worker.on('failed', (job, error) => {
    console.error(`Metrics aggregation job failed: ${job?.id}`, error.message);
  });

  console.log('Metrics aggregation worker started');
  return worker;
}

/**
 * Schedule periodic metrics aggregation for all organizations
 */
export async function schedulePeriodicAggregation(organizationIds: string[]): Promise<void> {
  const queue = new Queue<MetricsAggregationJobData>(QUEUE_NAME, {
    connection: REDIS_CONNECTION,
  });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  for (const orgId of organizationIds) {
    await queue.add(
      'aggregate-daily',
      {
        organizationId: orgId,
        tenantId: orgId,
        period: 'daily',
        startDate: startOfDay,
        endDate: now.toISOString(),
      },
      {
        repeat: {
          pattern: '0 2 * * *', // Run daily at 2 AM
        },
      }
    );
  }

  await queue.close();
}
