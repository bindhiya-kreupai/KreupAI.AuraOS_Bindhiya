import { Worker, Job, Queue } from 'bullmq';
import { WebhookService, WebhookConfig, WebhookPayload } from '../services/webhookService';
import { prisma } from '../lib/prisma';

export interface WebhookDeliveryJobData {
  webhookConfig: WebhookConfig;
  payload: WebhookPayload;
  attempt?: number;
  maxRetries?: number;
  /** Optional existing WebhookLog id to update on retry (instead of creating a new record) */
  existingLogId?: string;
}

export interface WebhookDeliveryResult {
  deliveryId: string;
  webhookId: string;
  logId?: string;
  success: boolean;
  statusCode: number;
  responseTime: number;
  attempt: number;
  error?: string;
}

const QUEUE_NAME = 'webhook-delivery';

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

/**
 * Process webhook delivery jobs from the BullMQ queue.
 *
 * Wired to real DB operations:
 *  - Creates a WebhookLog record before each delivery attempt
 *  - Updates statusCode, responseBody, responseTime, success and attempts on completion
 *  - On retry, increments the attempts counter on the existing log row
 *  - DB failures are non-fatal: the delivery result is always returned
 */
export async function startWebhookDeliveryWorker(): Promise<Worker<WebhookDeliveryJobData, WebhookDeliveryResult>> {
  const webhookService = new WebhookService();

  const worker = new Worker<WebhookDeliveryJobData, WebhookDeliveryResult>(
    QUEUE_NAME,
    async (job: Job<WebhookDeliveryJobData>): Promise<WebhookDeliveryResult> => {
      const {
        webhookConfig,
        payload,
        attempt = 1,
        maxRetries = 3,
        existingLogId,
      } = job.data;

      job.log(`Starting webhook delivery to ${webhookConfig.url} (attempt ${attempt}/${maxRetries})`);

      // ------------------------------------------------------------------ //
      // Create or prepare a WebhookLog record before delivery               //
      // ------------------------------------------------------------------ //
      let logId: string | undefined = existingLogId;

      if (!logId) {
        // First attempt — create a new log record
        try {
          const log = await prisma.webhookLog.create({
            data: {
              webhookId: webhookConfig.id,
              event: payload.event,
              payload: payload as unknown as Record<string, unknown>,
              success: false,
              attempts: 1,
              lastAttempt: new Date(),
            },
          });
          logId = log.id;
          job.log(`Created WebhookLog: ${logId}`);
        } catch (dbErr) {
          // Non-fatal: proceed without a log record
          job.log(
            `[WARN] Could not create WebhookLog: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`
          );
        }
      } else {
        // Retry — bump attempt counter
        try {
          await prisma.webhookLog.update({
            where: { id: logId },
            data: {
              attempts: { increment: 1 },
              lastAttempt: new Date(),
            },
          });
        } catch (dbErr) {
          job.log(
            `[WARN] Could not increment WebhookLog attempts: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`
          );
        }
      }

      // ------------------------------------------------------------------ //
      // Perform the actual HTTP delivery                                     //
      // ------------------------------------------------------------------ //
      const result = await webhookService.deliver(webhookConfig, payload);

      // ------------------------------------------------------------------ //
      // Update WebhookLog with delivery outcome                             //
      // ------------------------------------------------------------------ //
      if (logId) {
        try {
          await prisma.webhookLog.update({
            where: { id: logId },
            data: {
              statusCode: result.statusCode,
              responseTime: result.responseTime,
              success: result.success,
              ...(result.error ? { responseBody: result.error } : {}),
              lastAttempt: new Date(),
            },
          });
        } catch (dbErr) {
          job.log(
            `[WARN] Could not update WebhookLog outcome: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`
          );
        }
      }

      // ------------------------------------------------------------------ //
      // Re-queue on failure with exponential backoff                        //
      // ------------------------------------------------------------------ //
      if (!result.success && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s …
        const queue = new Queue(QUEUE_NAME, { connection: REDIS_CONNECTION });
        await queue.add(
          'deliver',
          {
            webhookConfig,
            payload,
            attempt: attempt + 1,
            maxRetries,
            existingLogId: logId, // pass through so we update the same log row
          },
          { delay }
        );
        await queue.close();
        job.log(`Scheduled retry #${attempt + 1} in ${delay}ms for webhook ${webhookConfig.id}`);
      }

      return {
        deliveryId: result.deliveryId,
        webhookId: result.webhookId,
        logId,
        success: result.success,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        attempt,
        error: result.error,
      };
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 10,
      limiter: {
        max: 100,
        duration: 1000, // max 100 deliveries per second across all workers
      },
    }
  );

  worker.on('completed', (job, result) => {
    console.log(
      `Webhook delivery completed: ${job.id} webhook: ${result.webhookId} success: ${result.success} attempt: ${result.attempt}`
    );
  });

  worker.on('failed', (job, error) => {
    console.error(`Webhook delivery job failed: ${job?.id}`, error.message);
  });

  console.log('Webhook delivery worker started');
  return worker;
}

/**
 * Add a webhook delivery job to the queue
 */
export async function enqueueWebhookDelivery(
  webhookConfig: WebhookConfig,
  payload: WebhookPayload
): Promise<string> {
  const queue = new Queue<WebhookDeliveryJobData>(QUEUE_NAME, {
    connection: REDIS_CONNECTION,
  });

  const job = await queue.add('deliver', {
    webhookConfig,
    payload,
    attempt: 1,
    maxRetries: 3,
  });

  await queue.close();
  return job.id || '';
}
