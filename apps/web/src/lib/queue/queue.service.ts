/**
 * Queue Service
 * High-level API for enqueueing and processing jobs
 */

import { rabbitmq, QUEUE_NAMES } from './rabbitmq';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/cache/redis';

export interface Job<T = any> {
  id: string;
  type: string;
  data: T;
  priority?: number;
  attempts?: number;
  maxAttempts?: number;
  createdAt: string;
  scheduledFor?: string;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

export type JobHandler<T = any> = (job: Job<T>) => Promise<JobResult>;

/**
 * Job status tracking
 */
export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

/**
 * Queue Service
 */
export class QueueService {
  private handlers: Map<string, JobHandler> = new Map();

  /**
   * Enqueue a job
   */
  async enqueue<T = any>(
    queue: string,
    jobType: string,
    data: T,
    options?: {
      priority?: number;
      maxAttempts?: number;
      scheduledFor?: Date;
    }
  ): Promise<string> {
    const jobId = crypto.randomUUID();

    const job: Job<T> = {
      id: jobId,
      type: jobType,
      data,
      priority: options?.priority || 0,
      attempts: 0,
      maxAttempts: options?.maxAttempts || 3,
      createdAt: new Date().toISOString(),
      scheduledFor: options?.scheduledFor?.toISOString(),
    };

    // Store job metadata in Redis
    await this.storeJobMetadata(jobId, {
      ...job,
      status: JobStatus.PENDING,
      queue,
    });

    // Publish to RabbitMQ
    const published = await rabbitmq.publish(queue, job);

    if (published) {
      logger.info({ jobId, jobType, queue }, 'Job enqueued');
    } else {
      logger.error({ jobId, jobType, queue }, 'Failed to enqueue job');
      // Fallback: process synchronously if queue is not available
      await this.processFallback(job);
    }

    return jobId;
  }

  /**
   * Register a job handler
   */
  registerHandler<T = any>(jobType: string, handler: JobHandler<T>): void {
    this.handlers.set(jobType, handler as JobHandler);
    logger.info({ jobType }, 'Job handler registered');
  }

  /**
   * Start consuming jobs from a queue
   */
  async startWorker(queue: string): Promise<string | null> {
    const consumerTag = await rabbitmq.consume(queue, async (message: Job) => {
      await this.processJob(message);
    });

    if (consumerTag) {
      logger.info({ queue, consumerTag }, 'Worker started');
    }

    return consumerTag;
  }

  /**
   * Process a job
   */
  private async processJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type);

    if (!handler) {
      logger.error({ jobId: job.id, jobType: job.type }, 'No handler registered for job type');
      await this.updateJobStatus(job.id, JobStatus.FAILED, {
        error: 'No handler registered',
      });
      return;
    }

    const startTime = performance.now();

    try {
      // Update status to processing
      await this.updateJobStatus(job.id, JobStatus.PROCESSING);

      logger.info({ jobId: job.id, jobType: job.type }, 'Processing job');

      // Execute handler
      const result = await handler(job);

      const duration = Math.round(performance.now() - startTime);

      if (result.success) {
        await this.updateJobStatus(job.id, JobStatus.COMPLETED, {
          result: result.data,
          duration,
        });

        logger.info(
          { jobId: job.id, jobType: job.type, duration },
          'Job completed successfully'
        );
      } else {
        throw new Error(result.error || 'Job failed');
      }
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        { error, jobId: job.id, jobType: job.type, duration },
        'Job processing failed'
      );

      // Retry logic
      const attempts = (job.attempts || 0) + 1;
      const maxAttempts = job.maxAttempts || 3;

      if (attempts < maxAttempts) {
        await this.updateJobStatus(job.id, JobStatus.RETRYING, {
          error: errorMessage,
          attempts,
          duration,
        });

        // Re-enqueue with incremented attempts
        const retryDelay = Math.min(1000 * Math.pow(2, attempts), 30000); // Exponential backoff, max 30s

        setTimeout(async () => {
          await rabbitmq.publish(QUEUE_NAMES.PAYROLL_PROCESSING, {
            ...job,
            attempts,
          });
        }, retryDelay);

        logger.info(
          { jobId: job.id, attempts, maxAttempts, retryDelay },
          'Job scheduled for retry'
        );
      } else {
        await this.updateJobStatus(job.id, JobStatus.FAILED, {
          error: errorMessage,
          attempts,
          duration,
        });

        logger.error({ jobId: job.id, attempts }, 'Job failed after max retries');
      }
    }
  }

  /**
   * Fallback processing when RabbitMQ is unavailable
   */
  private async processFallback(job: Job): Promise<void> {
    logger.warn({ jobId: job.id }, 'Processing job synchronously (fallback mode)');

    const handler = this.handlers.get(job.type);
    if (handler) {
      try {
        await handler(job);
        logger.info({ jobId: job.id }, 'Job processed synchronously');
      } catch (error) {
        logger.error({ error, jobId: job.id }, 'Synchronous job processing failed');
      }
    }
  }

  /**
   * Store job metadata in Redis
   */
  private async storeJobMetadata(jobId: string, metadata: any): Promise<void> {
    const key = `job:${jobId}`;
    await redis.set(key, metadata, 86400); // 24 hours TTL
  }

  /**
   * Update job status
   */
  private async updateJobStatus(
    jobId: string,
    status: JobStatus,
    additionalData?: any
  ): Promise<void> {
    const key = `job:${jobId}`;
    const existing = await redis.get(key);

    if (existing) {
      const updated = {
        ...existing,
        status,
        ...additionalData,
        updatedAt: new Date().toISOString(),
      };

      await redis.set(key, updated, 86400); // 24 hours TTL
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    const key = `job:${jobId}`;
    return await redis.get(key);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queue: string): Promise<{
    messageCount: number;
    consumerCount: number;
  } | null> {
    return await rabbitmq.getQueueStats(queue);
  }

  /**
   * Purge queue
   */
  async purgeQueue(queue: string): Promise<boolean> {
    return await rabbitmq.purgeQueue(queue);
  }
}

// Export singleton instance
export const queueService = new QueueService();
