import { Worker, Job, Queue } from 'bullmq';
import { WebhookService, WebhookConfig, WebhookPayload } from '../services/webhookService';

export interface WebhookDeliveryJobData {
  webhookConfig: WebhookConfig;
  payload: WebhookPayload;
  attempt?: number;
  maxRetries?: number;
}

export interface WebhookDeliveryResult {
  deliveryId: string;
  webhookId: string;
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
 * Process webhook delivery jobs from the BullMQ queue
 */
export async function startWebhookDeliveryWorker(): Promise<Worker<WebhookDeliveryJobData, WebhookDeliveryResult>> {
  const webhookService = new WebhookService();

  const worker = new Worker<WebhookDeliveryJobData, WebhookDeliveryResult>(
    QUEUE_NAME,
    async (job: Job<WebhookDeliveryJobData>) => {
      const { webhookConfig, payload, attempt = 1, maxRetries = 3 } = job.data;

      job.log('Starting webhook delivery to ' + webhookConfig.url + ' (attempt ' + attempt + ')');

      const result = await webhookService.deliver(webhookConfig, payload);

      if (!result.success && attempt < maxRetries) {
        // Re-queue with incremented attempt and exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        const queue = new Queue(QUEUE_NAME, { connection: REDIS_CONNECTION });
        await queue.add('deliver', {
          webhookConfig,
          payload,
          attempt: attempt + 1,
          maxRetries,
        }, { delay });
        await queue.close();
      }

      return {
        deliveryId: result.deliveryId,
        webhookId: result.webhookId,
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
        duration: 1000,
      },
    }
  );

  worker.on('completed', (job, result) => {
    console.log('Webhook delivery completed:', job.id, result.success ? 'success' : 'failed');
  });

  worker.on('failed', (job, error) => {
    console.error('Webhook delivery job failed:', job?.id, error.message);
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
