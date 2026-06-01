import crypto from 'crypto';
import axios from 'axios';

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
}

export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface DeliveryResult {
  webhookId: string;
  deliveryId: string;
  statusCode: number;
  success: boolean;
  responseTime: number;
  error?: string;
}

export interface RetryOptions {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
}

export class WebhookService {
  private defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    backoffMs: 1000,
    backoffMultiplier: 2,
  };

  /**
   * Deliver a webhook payload to the configured URL
   */
  async deliver(config: WebhookConfig, payload: WebhookPayload): Promise<DeliveryResult> {
    const deliveryId = crypto.randomUUID();
    const signature = this.generateSignature(payload, config.secret);
    const startTime = Date.now();

    try {
      const response = await axios.post(config.url, payload, {
        headers: {
          'X-Webhook-Signature': signature,
          'X-Webhook-Id': config.id,
          'X-Delivery-Id': deliveryId,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
        // Don't throw on 4xx/5xx — surface them in the DeliveryResult so the
        // caller can decide whether to retry. axios default throws on >= 400.
        validateStatus: () => true,
      });

      const responseTime = Date.now() - startTime;
      const success = response.status >= 200 && response.status < 300;

      return {
        webhookId: config.id,
        deliveryId,
        statusCode: response.status,
        success,
        responseTime,
        error: success ? undefined : `Subscriber returned HTTP ${response.status}`,
      };
    } catch (error) {
      // Network failure, timeout, DNS error, etc. — distinct from a non-2xx
      // response from the subscriber.
      const responseTime = Date.now() - startTime;
      return {
        webhookId: config.id,
        deliveryId,
        statusCode: 0,
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify a webhook signature against the payload
   */
  verifySignature(payload: WebhookPayload, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Generate HMAC-SHA256 signature for a payload
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    const digest = hmac.digest('hex');
    return 'sha256=' + digest;
  }

  /**
   * Retry a failed webhook delivery with exponential backoff
   */
  async retryDelivery(
    config: WebhookConfig,
    payload: WebhookPayload,
    options?: Partial<RetryOptions>
  ): Promise<DeliveryResult> {
    const retryOptions = { ...this.defaultRetryOptions, ...options };
    let lastResult: DeliveryResult | null = null;

    for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = retryOptions.backoffMs * Math.pow(retryOptions.backoffMultiplier, attempt - 1);
        await this.sleep(delay);
      }

      lastResult = await this.deliver(config, payload);

      if (lastResult.success) {
        return lastResult;
      }
    }

    return lastResult!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new WebhookService();
