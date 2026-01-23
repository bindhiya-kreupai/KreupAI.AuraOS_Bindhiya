import { Worker, Job, Queue } from 'bullmq';
import { MetricsService, MetricsQuery, AggregatedMetrics } from '../services/metricsService';

export interface MetricsAggregationJobData {
  organizationId: string;
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
}

const QUEUE_NAME = 'metrics-aggregation';

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

/**
 * Start the periodic metrics aggregation worker
 */
export async function startMetricsAggregationWorker(): Promise<Worker<MetricsAggregationJobData, MetricsAggregationResult>> {
  const metricsService = new MetricsService();

  const worker = new Worker<MetricsAggregationJobData, MetricsAggregationResult>(
    QUEUE_NAME,
    async (job: Job<MetricsAggregationJobData>) => {
      const { organizationId, departmentId, period, startDate, endDate } = job.data;
      const startTime = Date.now();

      job.log('Starting metrics aggregation for org ' + organizationId + ' period ' + period);

      const query: MetricsQuery = {
        organizationId,
        departmentId,
        startDate,
        endDate,
        granularity: period === 'daily' ? 'daily' : period === 'weekly' ? 'weekly' : 'monthly',
      };

      // Aggregate all metrics
      const metrics: AggregatedMetrics = await metricsService.getAllMetrics(query);

      // TODO: Cache the aggregated metrics in Redis with TTL based on period
      // const cacheTTL = period === 'daily' ? 3600 : period === 'weekly' ? 86400 : 604800;
      // await redis.setex(cacheKey, cacheTTL, JSON.stringify(metrics));

      const duration = Date.now() - startTime;
      const cacheDuration = period === 'daily' ? 3600000 : period === 'weekly' ? 86400000 : 604800000;

      return {
        organizationId,
        period,
        metricsCount: 3, // headcount, turnover, diversity
        duration,
        cachedUntil: new Date(Date.now() + cacheDuration).toISOString(),
      };
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 5,
    }
  );

  worker.on('completed', (job, result) => {
    console.log('Metrics aggregation completed:', job.id, 'duration:', result.duration + 'ms');
  });

  worker.on('failed', (job, error) => {
    console.error('Metrics aggregation job failed:', job?.id, error.message);
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
