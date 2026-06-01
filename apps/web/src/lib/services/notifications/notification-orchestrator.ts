/**
 * @module notification-orchestrator
 * @description Notification Orchestrator — multi-channel delivery routing,
 *              template resolution, bulk throttling, preference management,
 *              and scheduled delivery. Supports email, SMS, push, in-app,
 *              WhatsApp, Slack, and Microsoft Teams.
 * @project AuraOS Enterprise HCM Platform
 * @section 16 — Enterprise Backend Platform Services
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NotificationChannel =
  | 'email'
  | 'sms'
  | 'push'
  | 'in-app'
  | 'whatsapp'
  | 'slack'
  | 'teams';

export type NotificationCategory =
  | 'leave-request'
  | 'leave-approval'
  | 'payroll-processed'
  | 'attendance-alert'
  | 'document-expiry'
  | 'performance-review'
  | 'onboarding'
  | 'birthday'
  | 'work-anniversary'
  | 'policy-update'
  | 'compliance-reminder'
  | 'recruitment-update'
  | 'expense-approval'
  | 'system-alert'
  | 'custom';

export type DeliveryStatus =
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'bounced'
  | 'skipped';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  id?: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  category: NotificationCategory;
  subject: string;
  body: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  templateId?: string;
  scheduledAt?: string;
  expiresAt?: string;
  tenantId: string;
  senderId?: string;
  senderName?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface DeliveryRecord {
  notificationId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  attemptedAt: string;
  deliveredAt?: string;
  readAt?: string;
  error?: string;
  externalId?: string; // provider message ID
  provider: string;
}

export interface StoredNotification extends Notification {
  id: string;
  status: 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
  deliveryRecords: DeliveryRecord[];
  createdAt: string;
  processedAt?: string;
}

export interface ChannelPreference {
  channel: NotificationChannel;
  enabled: boolean;
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string; // HH:mm
  timezone?: string;
  categories: NotificationCategory[];
}

export interface UserPreferences {
  userId: string;
  tenantId: string;
  channels: ChannelPreference[];
  globalOptOut: boolean;
  language: string;
  timezone: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  templateId: string;
  name: string;
  category: NotificationCategory;
  subject: string; // Handlebars / Mustache template
  body: string;
  bodyHtml?: string;
  variables: string[];
  channels: NotificationChannel[];
  locale: string;
}

export interface BulkSendOptions {
  batchSize?: number;
  delayBetweenBatchesMs?: number;
  skipOptedOut?: boolean;
  trackDelivery?: boolean;
}

export interface ScheduledNotification extends StoredNotification {
  scheduledAt: string;
  recurrence?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    until?: string;
    count?: number;
  };
}

// ============================================================================
// IN-MEMORY STORES
// ============================================================================

const notificationStore = new Map<string, StoredNotification>();
const userPreferencesStore = new Map<string, UserPreferences>();
const scheduledQueue: ScheduledNotification[] = [];

// Built-in templates
const templates = new Map<string, NotificationTemplate>([
  [
    'leave-request-submitted',
    {
      templateId: 'leave-request-submitted',
      name: 'Leave Request Submitted',
      category: 'leave-request',
      subject: 'Leave Request from {{employeeName}} — {{leaveType}} ({{startDate}} to {{endDate}})',
      body: 'Dear {{managerName}},\n\n{{employeeName}} has submitted a {{leaveType}} leave request from {{startDate}} to {{endDate}} ({{days}} days).\n\nReason: {{reason}}\n\nPlease review and approve or reject this request.\n\n{{actionUrl}}',
      variables: [
        'employeeName',
        'managerName',
        'leaveType',
        'startDate',
        'endDate',
        'days',
        'reason',
        'actionUrl',
      ],
      channels: ['email', 'in-app', 'slack'],
      locale: 'en',
    },
  ],
  [
    'payroll-processed',
    {
      templateId: 'payroll-processed',
      name: 'Payroll Processed',
      category: 'payroll-processed',
      subject: 'Your payslip for {{month}} is ready',
      body: 'Dear {{employeeName}},\n\nYour payslip for {{month}} has been processed.\n\nNet Pay: {{currency}} {{netPay}}\n\nView and download your payslip at: {{actionUrl}}',
      variables: ['employeeName', 'month', 'currency', 'netPay', 'actionUrl'],
      channels: ['email', 'in-app', 'push'],
      locale: 'en',
    },
  ],
  [
    'performance-review-due',
    {
      templateId: 'performance-review-due',
      name: 'Performance Review Due',
      category: 'performance-review',
      subject: 'Performance Review Reminder — {{deadline}}',
      body: 'Dear {{employeeName}},\n\nYour performance review for the period {{reviewPeriod}} is due on {{deadline}}.\n\nPlease complete your self-assessment before the deadline.\n\n{{actionUrl}}',
      variables: ['employeeName', 'reviewPeriod', 'deadline', 'actionUrl'],
      channels: ['email', 'in-app', 'push', 'slack'],
      locale: 'en',
    },
  ],
  [
    'document-expiry-warning',
    {
      templateId: 'document-expiry-warning',
      name: 'Document Expiry Warning',
      category: 'document-expiry',
      subject: 'Document Expiring Soon — {{documentName}}',
      body: 'Dear {{employeeName}},\n\nYour document "{{documentName}}" is expiring on {{expiryDate}} ({{daysLeft}} days remaining).\n\nPlease upload the renewed document as soon as possible.\n\n{{actionUrl}}',
      variables: ['employeeName', 'documentName', 'expiryDate', 'daysLeft', 'actionUrl'],
      channels: ['email', 'in-app'],
      locale: 'en',
    },
  ],
]);

function generateId(): string {
  return `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================================
// CHANNEL ROUTING
// ============================================================================

function resolveChannels(
  notification: Notification,
  preferences?: UserPreferences
): NotificationChannel[] {
  if (notification.channels) return notification.channels;

  if (!preferences) return ['email', 'in-app'];

  if (preferences.globalOptOut) return [];

  return preferences.channels
    .filter((pref) => pref.enabled && pref.categories.includes(notification.category))
    .map((pref) => pref.channel);
}

function isInQuietHours(channel: ChannelPreference): boolean {
  if (!channel.quietHoursStart || !channel.quietHoursEnd) return false;

  const now = new Date();
  const [startH, startM] = channel.quietHoursStart.split(':').map(Number);
  const [endH, endM] = channel.quietHoursEnd.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  // Overnight quiet hours
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

async function dispatchToChannel(
  notification: StoredNotification,
  channel: NotificationChannel
): Promise<DeliveryRecord> {
  const record: DeliveryRecord = {
    notificationId: notification.id,
    channel,
    status: 'queued',
    attemptedAt: new Date().toISOString(),
    provider: getProvider(channel),
  };

  try {
    // Simulate channel-specific delivery
    await new Promise((r) => setTimeout(r, 10 + Math.random() * 20));

    // Simulate 95% success rate
    if (Math.random() < 0.95) {
      record.status = 'sent';
      record.deliveredAt = new Date().toISOString();
      record.externalId = `ext_${Math.random().toString(36).slice(2, 11)}`;
    } else {
      record.status = 'failed';
      record.error = 'Provider temporary unavailability';
    }
  } catch (err: any) {
    record.status = 'failed';
    record.error = String(err);
  }

  return record;
}

function getProvider(channel: NotificationChannel): string {
  const providers: Record<NotificationChannel, string> = {
    email: 'sendgrid',
    sms: 'twilio',
    push: 'firebase-fcm',
    'in-app': 'aura-internal',
    whatsapp: 'twilio-whatsapp',
    slack: 'slack-api',
    teams: 'ms-graph-api',
  };
  return providers[channel] ?? 'unknown';
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * send — route a notification to appropriate channel(s) based on user preferences.
 */
export async function send(notification: Notification): Promise<StoredNotification> {
  const id = notification.id ?? generateId();
  const preferences = userPreferencesStore.get(notification.recipientId);
  const channels = resolveChannels(notification, preferences);

  const stored: StoredNotification = {
    ...notification,
    id,
    status: 'processing',
    deliveryRecords: [],
    createdAt: new Date().toISOString(),
  };

  notificationStore.set(id, stored);

  // Dispatch to all resolved channels in parallel
  const deliveryPromises = channels.map((channel) => dispatchToChannel(stored, channel));

  const deliveryResults = await Promise.allSettled(deliveryPromises);
  deliveryResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      stored.deliveryRecords.push(result.value);
    }
  });

  stored.status = stored.deliveryRecords.some((r) => r.status === 'sent') ? 'completed' : 'failed';
  stored.processedAt = new Date().toISOString();

  return { ...stored };
}

/**
 * sendBulk — batch send with configurable throttling to prevent provider rate limits.
 */
export async function sendBulk(
  notifications: Notification[],
  options: BulkSendOptions = {}
): Promise<{
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  results: StoredNotification[];
}> {
  const { batchSize = 50, delayBetweenBatchesMs = 100, skipOptedOut = true } = options;

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const results: StoredNotification[] = [];

  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (notification) => {
        if (skipOptedOut) {
          const prefs = userPreferencesStore.get(notification.recipientId);
          if (prefs?.globalOptOut) {
            skipped++;
            return;
          }
        }

        const result = await send(notification);
        results.push(result);

        if (result.status === 'completed') sent++;
        else failed++;
      })
    );

    if (i + batchSize < notifications.length) {
      await new Promise((r) => setTimeout(r, delayBetweenBatchesMs));
    }
  }

  return { total: notifications.length, sent, failed, skipped, results };
}

/**
 * renderTemplate — resolve template variables to produce final notification content.
 */
export function renderTemplate(
  templateId: string,
  data: Record<string, unknown>
): { subject: string; body: string; bodyHtml?: string } {
  const template = templates.get(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  function interpolate(str: string, vars: Record<string, unknown>): string {
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`;
    });
  }

  return {
    subject: interpolate(template.subject, data),
    body: interpolate(template.body, data),
    bodyHtml: template.bodyHtml ? interpolate(template.bodyHtml, data) : undefined,
  };
}

/**
 * getDeliveryStatus — per-channel delivery tracking for a notification.
 */
export function getDeliveryStatus(notificationId: string): {
  notificationId: string;
  overallStatus: StoredNotification['status'];
  channels: DeliveryRecord[];
} {
  const notification = notificationStore.get(notificationId);
  if (!notification) {
    throw new Error(`Notification not found: ${notificationId}`);
  }

  return {
    notificationId,
    overallStatus: notification.status,
    channels: notification.deliveryRecords,
  };
}

/**
 * getPreferences — retrieve channel preferences for a user.
 */
export function getPreferences(userId: string): UserPreferences {
  const prefs = userPreferencesStore.get(userId);
  if (prefs) return { ...prefs };

  // Return defaults
  const defaultPrefs: UserPreferences = {
    userId,
    tenantId: 'default',
    globalOptOut: false,
    language: 'en',
    timezone: 'UTC',
    channels: [
      {
        channel: 'email',
        enabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        categories: [
          'leave-request',
          'leave-approval',
          'payroll-processed',
          'performance-review',
          'document-expiry',
          'policy-update',
          'compliance-reminder',
          'system-alert',
        ],
      },
      {
        channel: 'in-app',
        enabled: true,
        categories: [
          'leave-request',
          'leave-approval',
          'attendance-alert',
          'performance-review',
          'birthday',
          'work-anniversary',
          'expense-approval',
          'recruitment-update',
        ],
      },
      {
        channel: 'push',
        enabled: true,
        quietHoursStart: '23:00',
        quietHoursEnd: '07:00',
        categories: ['leave-approval', 'system-alert', 'payroll-processed'],
      },
      {
        channel: 'sms',
        enabled: false,
        categories: ['system-alert'],
      },
      { channel: 'whatsapp', enabled: false, categories: [] },
      { channel: 'slack', enabled: false, categories: [] },
      { channel: 'teams', enabled: false, categories: [] },
    ],
    updatedAt: new Date().toISOString(),
  };

  return defaultPrefs;
}

/**
 * updatePreferences — save user channel preferences.
 */
export function updatePreferences(
  userId: string,
  prefs: Partial<Omit<UserPreferences, 'userId' | 'updatedAt'>>
): UserPreferences {
  const existing = getPreferences(userId);
  const updated: UserPreferences = {
    ...existing,
    ...prefs,
    userId,
    updatedAt: new Date().toISOString(),
  };
  userPreferencesStore.set(userId, updated);
  return { ...updated };
}

/**
 * scheduleNotification — queue a notification for future delivery.
 */
export function scheduleNotification(
  notification: Notification,
  scheduledAt: string,
  recurrence?: ScheduledNotification['recurrence']
): ScheduledNotification {
  const id = generateId();
  const scheduled: ScheduledNotification = {
    ...notification,
    id,
    status: 'scheduled',
    deliveryRecords: [],
    createdAt: new Date().toISOString(),
    scheduledAt,
    recurrence,
  };

  notificationStore.set(id, scheduled);
  scheduledQueue.push(scheduled);

  return { ...scheduled };
}

/**
 * processScheduledQueue — process due notifications from the scheduled queue.
 * Called by a cron job (e.g. every minute).
 */
export async function processScheduledQueue(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const now = new Date().toISOString();
  const due = scheduledQueue.filter((n) => n.scheduledAt <= now && n.status === 'scheduled');

  let sent = 0;
  let failed = 0;

  for (const notification of due) {
    const result = await send(notification);
    if (result.status === 'completed') sent++;
    else failed++;

    // Remove from queue (or reschedule if recurring)
    const idx = scheduledQueue.indexOf(notification);
    if (idx >= 0) scheduledQueue.splice(idx, 1);
  }

  return { processed: due.length, sent, failed };
}

// Export quiet hours checker for testing
export { isInQuietHours };
