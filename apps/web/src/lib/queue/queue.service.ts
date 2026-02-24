/**
 * Queue Service
 * High-level API for enqueueing and processing jobs
 *
 * NOTE: This is a backward-compatibility wrapper.
 * New code should use @aura/messaging directly via messaging.service.ts
 */

import { messagingService, QUEUE_MAPPING } from './messaging.service';
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
 * Queue Service (Backward Compatibility Wrapper)
 */
export class QueueService {
  private handlers: Map<string, JobHandler> = new Map();

  /**
   * Enqueue a job (delegates to messaging service)
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
    // Delegate to messaging service with default tenantId
    return await messagingService.enqueue(queue, jobType, data, {
      ...options,
      tenantId: 'default', // TODO: Extract from context
    });
  }

  /**
   * Register a job handler (delegates to messaging service)
   */
  registerHandler<T = any>(jobType: string, handler: JobHandler<T>): void {
    messagingService.registerHandler(jobType, handler);
    this.handlers.set(jobType, handler as JobHandler);
  }

  /**
   * Start consuming jobs from a queue (delegates to messaging service)
   */
  async startWorker(queue: string): Promise<string | null> {
    await messagingService.startWorker(queue);
    logger.info({ queue }, 'Worker started (via messaging service)');
    return null; // messaging service doesn't return consumer tag
  }

  /**
   * Get job status (delegates to messaging service)
   */
  async getJobStatus(jobId: string): Promise<any> {
    return await messagingService.getJobStatus(jobId);
  }

  /**
   * Get queue statistics
   * @deprecated Queue stats not available through @aura/messaging
   */
  async getQueueStats(queue: string): Promise<{
    messageCount: number;
    consumerCount: number;
  } | null> {
    logger.warn('getQueueStats is deprecated and not supported by @aura/messaging');
    return null;
  }

  /**
   * Purge queue
   * @deprecated Queue purge not available through @aura/messaging
   */
  async purgeQueue(queue: string): Promise<boolean> {
    logger.warn('purgeQueue is deprecated and not supported by @aura/messaging');
    return false;
  }
}

// Export singleton instance
export const queueService = new QueueService();
