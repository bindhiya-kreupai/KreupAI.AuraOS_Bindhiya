/**
 * @module notification-orchestrator
 * @description Multi-channel notification orchestrator for AuraOS.
 *   Routes notifications to the correct delivery channel(s), handles
 *   template interpolation, batch sending with rate limiting, and logs
 *   every delivery attempt.
 *
 *   Channels:
 *     - in-app  : via WebSocket (Socket.IO)
 *     - email   : Nodemailer (SMTP)
 *     - sms     : Twilio (stub — sends to console in development)
 *     - push    : Firebase Admin (stub — logs in development)
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationCategory =
  | 'leave'
  | 'payroll'
  | 'performance'
  | 'onboarding'
  | 'compliance'
  | 'announcement'
  | 'approval'
  | 'system'
  | 'recognition'
  | 'alert';

export interface NotificationRecipient {
  userId: string;
  email?: string;
  phone?: string;        // E.164 format
  fcmToken?: string;     // Firebase FCM device token
  name?: string;
}

export interface NotificationPayload {
  /** Unique idempotency key — duplicates within 24 h will be ignored. */
  idempotencyKey?: string;
  recipients: NotificationRecipient | NotificationRecipient[];
  channels: NotificationChannel[];
  category: NotificationCategory;
  priority?: NotificationPriority;
  subject: string;
  /** Plain-text body. Use {{variable}} placeholders for interpolation. */
  body: string;
  /** HTML body for email channel. If omitted, body is used verbatim. */
  htmlBody?: string;
  /** Template variables: { employee: { name: "Alice" }, ... } */
  templateData?: Record<string, unknown>;
  /** ISO timestamp — if set, the notification will be sent after this time. */
  scheduledAt?: string;
  /** Link to navigate to when the in-app notification is clicked. */
  actionUrl?: string;
  /** Icon / emoji for the in-app notification. */
  icon?: string;
  metadata?: Record<string, unknown>;
}

export type DeliveryStatus = 'sent' | 'failed' | 'skipped' | 'queued';

export interface DeliveryAttempt {
  id: string;
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  sentAt?: string;
  failedAt?: string;
  error?: string;
  providerMessageId?: string;
  attempts: number;
}

export interface NotificationResult {
  notificationId: string;
  idempotencyKey?: string;
  recipientCount: number;
  deliveryAttempts: DeliveryAttempt[];
  successCount: number;
  failureCount: number;
  skippedCount: number;
}

export interface BulkNotificationResult {
  totalNotifications: number;
  successCount: number;
  failureCount: number;
  results: NotificationResult[];
  durationMs: number;
}

// ── In-memory deduplication store ─────────────────────────────────────────────
// In production this would be backed by Redis with a 24-hour TTL.

const sentKeys = new Set<string>();

// ── Delivery log ───────────────────────────────────────────────────────────────
// In production this would persist to the database.

const deliveryLog: DeliveryAttempt[] = [];

export function getDeliveryLog(): DeliveryAttempt[] {
  return [...deliveryLog];
}

export function getDeliveryLogByUser(userId: string): DeliveryAttempt[] {
  return deliveryLog.filter((a) => a.userId === userId);
}

// ── Template Engine ────────────────────────────────────────────────────────────

/**
 * Interpolate `{{path.to.value}}` placeholders in a template string.
 *
 * @example
 * interpolate("Hello, {{employee.name}}!", { employee: { name: "Alice" } })
 * // => "Hello, Alice!"
 */
export function interpolate(
  template: string,
  data: Record<string, unknown> = {}
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path: string) => {
    const keys = path.trim().split('.');
    let current: unknown = data;

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return match; // leave placeholder as-is if path not found
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current !== null && current !== undefined ? String(current) : match;
  });
}

// ── WebSocket (in-app) stub ────────────────────────────────────────────────────

/**
 * In a real deployment this holds a reference to the Socket.IO server instance
 * obtained via dependency injection.  Here we keep a simple module-level ref.
 */
let _socketServer: {
  to: (room: string) => { emit: (event: string, data: unknown) => void };
} | null = null;

export function setSocketServer(server: typeof _socketServer): void {
  _socketServer = server;
}

// ── Email Provider (Nodemailer stub) ──────────────────────────────────────────

async function sendEmail(
  recipient: NotificationRecipient,
  subject: string,
  textBody: string,
  htmlBody?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!recipient.email) {
    return { success: false, error: 'No email address for recipient' };
  }

  // In production: create a Nodemailer transporter from env config.
  // For now we simulate a 95 % success rate in non-production environments.
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.log(
      `[NotificationOrchestrator] [EMAIL-STUB] To: ${recipient.email} | Subject: ${subject} | Body: ${textBody.slice(0, 80)}`
    );
    return { success: true, messageId: `stub_email_${Date.now()}` };
  }

  try {
    // Production: wire up nodemailer here.
    // const transporter = nodemailer.createTransport({ ... });
    // const info = await transporter.sendMail({ from, to, subject, text, html });
    // return { success: true, messageId: info.messageId };
    throw new Error('Production email provider not configured');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Email send failed',
    };
  }
}

// ── SMS Provider (Twilio stub) ─────────────────────────────────────────────────

async function sendSMS(
  recipient: NotificationRecipient,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!recipient.phone) {
    return { success: false, error: 'No phone number for recipient' };
  }

  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.log(
      `[NotificationOrchestrator] [SMS-STUB] To: ${recipient.phone} | Body: ${body.slice(0, 60)}`
    );
    return { success: true, messageId: `stub_sms_${Date.now()}` };
  }

  try {
    // Production: wire up Twilio here.
    // const client = twilio(accountSid, authToken);
    // const msg = await client.messages.create({ to: recipient.phone, from, body });
    // return { success: true, messageId: msg.sid };
    throw new Error('Production SMS provider (Twilio) not configured');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'SMS send failed',
    };
  }
}

// ── Push Provider (Firebase Admin stub) ───────────────────────────────────────

async function sendPush(
  recipient: NotificationRecipient,
  title: string,
  body: string,
  actionUrl?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!recipient.fcmToken) {
    return { success: false, error: 'No FCM token for recipient' };
  }

  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.log(
      `[NotificationOrchestrator] [PUSH-STUB] Token: ${recipient.fcmToken.slice(0, 12)}… | Title: ${title} | Body: ${body.slice(0, 60)}`
    );
    return { success: true, messageId: `stub_push_${Date.now()}` };
  }

  try {
    // Production: wire up firebase-admin here.
    // const message: admin.messaging.Message = { token: recipient.fcmToken, notification: { title, body } };
    // const response = await admin.messaging().send(message);
    // return { success: true, messageId: response };
    throw new Error('Production push provider (Firebase) not configured');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Push notification failed',
    };
  }
}

// ── In-App delivery via WebSocket ─────────────────────────────────────────────

async function sendInApp(
  recipient: NotificationRecipient,
  subject: string,
  body: string,
  actionUrl?: string,
  icon?: string,
  category?: NotificationCategory
): Promise<{ success: boolean; error?: string }> {
  if (_socketServer) {
    try {
      _socketServer.to(`user:${recipient.userId}`).emit('notification', {
        subject,
        body,
        actionUrl,
        icon,
        category,
        timestamp: new Date().toISOString(),
        read: false,
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Socket emit failed',
      };
    }
  }

  // Fallback log if no socket server is attached
  console.log(
    `[NotificationOrchestrator] [IN-APP] userId: ${recipient.userId} | Subject: ${subject}`
  );
  return { success: true };
}

// ── Core: send to one recipient on one channel ─────────────────────────────────

async function deliverToChannel(
  notificationId: string,
  recipient: NotificationRecipient,
  channel: NotificationChannel,
  subject: string,
  body: string,
  htmlBody?: string,
  actionUrl?: string,
  icon?: string,
  category?: NotificationCategory
): Promise<DeliveryAttempt> {
  const attemptId = `${notificationId}_${recipient.userId}_${channel}_${Date.now()}`;
  const attempt: DeliveryAttempt = {
    id: attemptId,
    notificationId,
    userId: recipient.userId,
    channel,
    status: 'queued',
    attempts: 1,
  };

  let result: { success: boolean; messageId?: string; error?: string };

  switch (channel) {
    case 'email':
      result = await sendEmail(recipient, subject, body, htmlBody);
      break;
    case 'sms':
      result = await sendSMS(recipient, body);
      break;
    case 'push':
      result = await sendPush(recipient, subject, body, actionUrl);
      break;
    case 'in-app':
      result = await sendInApp(recipient, subject, body, actionUrl, icon, category);
      break;
    default:
      result = { success: false, error: `Unknown channel: ${channel}` };
  }

  if (result.success) {
    attempt.status = 'sent';
    attempt.sentAt = new Date().toISOString();
    attempt.providerMessageId = result.messageId;
  } else {
    attempt.status = 'failed';
    attempt.failedAt = new Date().toISOString();
    attempt.error = result.error;
    console.error(
      `[NotificationOrchestrator] Delivery failed | notificationId=${notificationId} userId=${recipient.userId} channel=${channel} error=${result.error}`
    );
  }

  // Persist attempt to log
  deliveryLog.push(attempt);

  return attempt;
}

// ── Public API: sendNotification ───────────────────────────────────────────────

/**
 * Send a notification through the specified channels.
 * Handles template interpolation, idempotency, and per-channel delivery.
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<NotificationResult> {
  const notificationId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Idempotency check
  const iKey = payload.idempotencyKey;
  if (iKey) {
    if (sentKeys.has(iKey)) {
      console.warn(
        `[NotificationOrchestrator] Duplicate notification suppressed: idempotencyKey=${iKey}`
      );
      return {
        notificationId,
        idempotencyKey: iKey,
        recipientCount: 0,
        deliveryAttempts: [],
        successCount: 0,
        failureCount: 0,
        skippedCount: 1,
      };
    }
    sentKeys.add(iKey);
    // Cleanup after 24 h to avoid unbounded growth
    setTimeout(() => sentKeys.delete(iKey), 24 * 60 * 60 * 1000);
  }

  // Normalise recipients to array
  const recipients = Array.isArray(payload.recipients)
    ? payload.recipients
    : [payload.recipients];

  const data = payload.templateData ?? {};
  const subject = interpolate(payload.subject, data);
  const body = interpolate(payload.body, data);
  const htmlBody = payload.htmlBody ? interpolate(payload.htmlBody, data) : undefined;

  // Deliver to all recipients on all channels in parallel
  const attemptPromises: Promise<DeliveryAttempt>[] = [];

  for (const recipient of recipients) {
    for (const channel of payload.channels) {
      // Skip channels that don't have required contact info
      if (channel === 'email' && !recipient.email) {
        deliveryLog.push({
          id: `skip_${Date.now()}`,
          notificationId,
          userId: recipient.userId,
          channel,
          status: 'skipped',
          error: 'No email address',
          attempts: 0,
        });
        continue;
      }
      if (channel === 'sms' && !recipient.phone) {
        deliveryLog.push({
          id: `skip_${Date.now()}`,
          notificationId,
          userId: recipient.userId,
          channel,
          status: 'skipped',
          error: 'No phone number',
          attempts: 0,
        });
        continue;
      }
      if (channel === 'push' && !recipient.fcmToken) {
        deliveryLog.push({
          id: `skip_${Date.now()}`,
          notificationId,
          userId: recipient.userId,
          channel,
          status: 'skipped',
          error: 'No FCM token',
          attempts: 0,
        });
        continue;
      }

      attemptPromises.push(
        deliverToChannel(
          notificationId,
          recipient,
          channel,
          subject,
          body,
          htmlBody,
          payload.actionUrl,
          payload.icon,
          payload.category
        )
      );
    }
  }

  const attempts = await Promise.all(attemptPromises);

  const successCount = attempts.filter((a) => a.status === 'sent').length;
  const failureCount = attempts.filter((a) => a.status === 'failed').length;
  const skippedCount = deliveryLog.filter(
    (a) => a.notificationId === notificationId && a.status === 'skipped'
  ).length;

  return {
    notificationId,
    idempotencyKey: iKey,
    recipientCount: recipients.length,
    deliveryAttempts: attempts,
    successCount,
    failureCount,
    skippedCount,
  };
}

// ── Public API: sendBulkNotifications ─────────────────────────────────────────

const DEFAULT_BATCH_SIZE = 50;          // notifications per batch
const DEFAULT_RATE_LIMIT_MS = 200;      // pause between batches (ms)

/**
 * Send multiple notifications in batches with rate limiting to avoid
 * overwhelming downstream email/SMS providers.
 */
export async function sendBulkNotifications(
  notifications: NotificationPayload[],
  options: {
    batchSize?: number;
    rateLimitMs?: number;
    onProgress?: (sent: number, total: number) => void;
  } = {}
): Promise<BulkNotificationResult> {
  const {
    batchSize = DEFAULT_BATCH_SIZE,
    rateLimitMs = DEFAULT_RATE_LIMIT_MS,
    onProgress,
  } = options;

  const startedAt = Date.now();
  const results: NotificationResult[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);

    const batchResults = await Promise.all(batch.map((n) => sendNotification(n)));
    results.push(...batchResults);

    for (const r of batchResults) {
      successCount += r.successCount;
      failureCount += r.failureCount;
    }

    onProgress?.(Math.min(i + batchSize, notifications.length), notifications.length);

    // Rate-limit pause between batches (skip after last batch)
    if (i + batchSize < notifications.length && rateLimitMs > 0) {
      await sleep(rateLimitMs);
    }
  }

  return {
    totalNotifications: notifications.length,
    successCount,
    failureCount,
    results,
    durationMs: Date.now() - startedAt,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
