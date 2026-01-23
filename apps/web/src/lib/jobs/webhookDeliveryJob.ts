export interface JobResult {
  success: boolean;
  processedCount: number;
  errors: string[];
}

interface WebhookDeliveryAttempt {
  attemptNumber: number;
  timestamp: string;
  statusCode: number | null;
  success: boolean;
  errorMessage: string | null;
}

const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 5000, 30000, 120000, 600000]; // exponential backoff in ms

export async function deliverWebhook(
  webhookId: string,
  payload: any
): Promise<JobResult> {
  const errors: string[] = [];
  let processedCount = 0;
  const attempts: WebhookDeliveryAttempt[] = [];

  console.log(`[WebhookJob] Starting webhook delivery: ${webhookId}`);
  console.log(`[WebhookJob] Payload size: ${JSON.stringify(payload).length} bytes`);

  // Mock webhook endpoint
  const endpoint = `https://api.example.com/webhooks/${webhookId}`;
  console.log(`[WebhookJob] Target endpoint: ${endpoint}`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`[WebhookJob] Attempt ${attempt}/${MAX_RETRIES}...`);

    // Simulate delivery attempt
    const mockSuccess = attempt >= 2; // Simulate first attempt fails, second succeeds
    const statusCode = mockSuccess ? 200 : (attempt === 1 ? 503 : 500);

    const deliveryAttempt: WebhookDeliveryAttempt = {
      attemptNumber: attempt,
      timestamp: new Date().toISOString(),
      statusCode,
      success: mockSuccess,
      errorMessage: mockSuccess ? null : `HTTP ${statusCode}: Service Unavailable`,
    };
    attempts.push(deliveryAttempt);

    if (mockSuccess) {
      console.log(`[WebhookJob] Delivery successful on attempt ${attempt} (HTTP ${statusCode})`);
      processedCount = 1;
      break;
    } else {
      const errorMsg = `Attempt ${attempt} failed: HTTP ${statusCode}`;
      console.log(`[WebhookJob] ${errorMsg}`);
      errors.push(errorMsg);

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt - 1];
        console.log(`[WebhookJob] Retrying in ${delay / 1000}s...`);
        // In production, would await a delay here
      }
    }
  }

  const success = processedCount > 0;

  if (!success) {
    console.log(`[WebhookJob] All ${MAX_RETRIES} delivery attempts failed for webhook ${webhookId}`);
    console.log("[WebhookJob] Marking webhook as failed, alerting admin");
  } else {
    // Remove transient errors if ultimately successful
    errors.length = 0;
  }

  console.log(`[WebhookJob] Delivery job finished. Success: ${success}`);
  return { success, processedCount, errors };
}
