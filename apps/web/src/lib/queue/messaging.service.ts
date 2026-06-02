/**
 * Messaging Service using @aura/messaging package
 * Replaces custom RabbitMQ implementation
 */

import type { MessagePayload } from '@aura/messaging';
import { getQueueManager, QUEUES } from '@aura/messaging';
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
 * Queue names mapping to @aura/messaging QUEUES
 */
export const QUEUE_MAPPING = {
  PAYROLL_PROCESSING: QUEUES.PAYROLL_CALCULATION.name,
  REPORT_GENERATION: QUEUES.DOCUMENT_GENERATION.name,
  EMAIL_NOTIFICATIONS: QUEUES.EMAIL_NOTIFICATIONS.name,
  DATA_EXPORT: QUEUES.PAYROLL_EXPORT.name,
  BULK_IMPORT: QUEUES.DOCUMENT_PROCESSING.name,
  SCHEDULED_JOBS: QUEUES.AUDIT_EVENTS.name,
} as const;

/**
 * Messaging Service using @aura/messaging
 */
export class MessagingService {
  private queueManager = getQueueManager();
  private handlers: Map<string, JobHandler> = new Map();
  private isInitialized = false;

  /**
   * Initialize the messaging service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.queueManager.connect();
      this.isInitialized = true;
      logger.info('Messaging service initialized successfully');
    } catch (error: any) {
      logger.error({ error }, 'Failed to initialize messaging service');
      throw error;
    }
  }

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
      tenantId: string;
      userId?: string;
    }
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

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
      tenantId: options?.tenantId,
      userId: options?.userId,
    });

    // Create message payload for @aura/messaging
    const messagePayload: MessagePayload = {
      id: jobId,
      type: jobType,
      tenantId: options?.tenantId || 'default',
      userId: options?.userId,
      data: job,
      timestamp: new Date(),
      correlationId: jobId,
      retryCount: 0,
    };

    try {
      // Map legacy queue names to new queue names
      const queueName = QUEUE_MAPPING[queue as keyof typeof QUEUE_MAPPING] || queue;

      // Publish to RabbitMQ via @aura/messaging
      const published = await this.queueManager.publish(queueName, messagePayload);

      if (published) {
        logger.info({ jobId, jobType, queue: queueName }, 'Job enqueued');
      } else {
        logger.error({ jobId, jobType, queue: queueName }, 'Failed to enqueue job');
        // Fallback: process synchronously if queue is not available
        await this.processFallback(job);
      }
    } catch (error: any) {
      logger.error({ error, jobId, jobType, queue }, 'Error enqueuing job');
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
  async startWorker(queue: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Map legacy queue names to new queue names
    const queueName = QUEUE_MAPPING[queue as keyof typeof QUEUE_MAPPING] || queue;

    await this.queueManager.subscribe(queueName, async (message: MessagePayload) => {
      // Extract the job from the message data
      const job = message.data as Job;
      await this.processJob(job);
    });

    logger.info({ queue: queueName }, 'Worker started');
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
    } catch (error: any) {
      const duration = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        { error, jobId: job.id, jobType: job.type, duration },
        'Job processing failed'
      );

      // Update job status to failed (retry logic is handled by @aura/messaging)
      await this.updateJobStatus(job.id, JobStatus.FAILED, {
        error: errorMessage,
        duration,
      });

      // Re-throw to let @aura/messaging handle retry logic
      throw error;
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
      } catch (error: any) {
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
   * Check if messaging service is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.queueManager.isReady();
  }

  /**
   * Disconnect from messaging service
   */
  async disconnect(): Promise<void> {
    await this.queueManager.disconnect();
    this.isInitialized = false;
    logger.info('Messaging service disconnected');
  }
}

// Export singleton instance
export const messagingService = new MessagingService();

// Export for backward compatibility
export { messagingService as queueService };
