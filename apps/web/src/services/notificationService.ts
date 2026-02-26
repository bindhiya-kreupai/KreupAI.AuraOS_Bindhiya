/**
 * @module notificationService
 * @description Frontend notification service — CRUD for the current user's
 *   notifications, unread count, and channel preference management.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

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

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  subject: string;
  body: string;
  icon?: string;
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilters {
  category?: NotificationCategory;
  read?: boolean;
  priority?: NotificationPriority;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedNotifications {
  items: Notification[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

// ── Channel preferences ───────────────────────────────────────────────────────

export interface ChannelPreference {
  channel: NotificationChannel;
  enabled: boolean;
}

export interface CategoryPreference {
  category: NotificationCategory;
  label: string;
  description: string;
  channels: ChannelPreference[];
}

export interface NotificationPreferences {
  userId: string;
  preferences: CategoryPreference[];
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // "HH:mm" e.g. "22:00"
  quietHoursEnd?: string; // "HH:mm" e.g. "07:00"
  timezone?: string;
}

export type UpdatePreferencesPayload = Omit<NotificationPreferences, 'userId'>;

// ── Constants ──────────────────────────────────────────────────────────────────

const BASE = '/api/v1/notifications';

export const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; description: string; icon: string }
> = {
  leave: {
    label: 'Leave & Time Off',
    description: 'Leave requests, approvals, and balance alerts.',
    icon: 'Calendar',
  },
  payroll: {
    label: 'Payroll',
    description: 'Pay slip availability, payroll processing updates.',
    icon: 'DollarSign',
  },
  performance: {
    label: 'Performance',
    description: 'Review cycles, goal updates, and feedback.',
    icon: 'TrendingUp',
  },
  onboarding: {
    label: 'Onboarding',
    description: 'Task assignments and onboarding milestones.',
    icon: 'UserPlus',
  },
  compliance: {
    label: 'Compliance',
    description: 'Policy updates, mandatory training, and expiry reminders.',
    icon: 'Shield',
  },
  announcement: {
    label: 'Announcements',
    description: 'Company-wide announcements and news.',
    icon: 'Megaphone',
  },
  approval: {
    label: 'Approvals',
    description: 'Pending approvals and workflow actions.',
    icon: 'CheckSquare',
  },
  system: {
    label: 'System',
    description: 'Maintenance windows, outages, and system alerts.',
    icon: 'Settings',
  },
  recognition: {
    label: 'Recognition',
    description: 'Kudos, awards, and peer recognitions.',
    icon: 'Star',
  },
  alert: {
    label: 'Alerts',
    description: 'Urgent security and operational alerts.',
    icon: 'AlertTriangle',
  },
};

// ── Notification CRUD ─────────────────────────────────────────────────────────

/**
 * Fetch paginated notifications for the current user.
 */
export async function getNotifications(
  filters: NotificationFilters = {}
): Promise<PaginatedNotifications> {
  const params: Record<string, string | number | boolean | undefined> = {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
    ...(filters.category && { category: filters.category }),
    ...(filters.read !== undefined && { read: filters.read }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  };

  try {
    return await APIClient.get<PaginatedNotifications>(BASE, params);
  } catch {
    // Return empty state when the API isn't available yet
    return {
      items: [],
      total: 0,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
      unreadCount: 0,
    };
  }
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(id: string): Promise<void> {
  await APIClient.patch(`${BASE}/${id}/read`, {});
}

/**
 * Mark all of the current user's notifications as read.
 */
export async function markAllRead(): Promise<void> {
  await APIClient.patch(`${BASE}/read-all`, {});
}

/**
 * Get the unread count badge value for the current user.
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const res = await APIClient.get<UnreadCountResponse>(`${BASE}/unread-count`);
    return res.count;
  } catch {
    return 0;
  }
}

/**
 * Delete a single notification.
 */
export async function deleteNotification(id: string): Promise<void> {
  await APIClient.delete(`${BASE}/${id}`);
}

/**
 * Delete all read notifications for the current user.
 */
export async function clearReadNotifications(): Promise<void> {
  await APIClient.delete(`${BASE}/clear-read`);
}

// ── Notification Preferences ──────────────────────────────────────────────────

/**
 * Fetch the current user's notification channel preferences.
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    return await APIClient.get<NotificationPreferences>(`${BASE}/preferences`);
  } catch {
    return buildDefaultPreferences();
  }
}

/**
 * Save updated notification preferences for the current user.
 */
export async function updatePreferences(
  prefs: UpdatePreferencesPayload
): Promise<NotificationPreferences> {
  return APIClient.put<NotificationPreferences>(`${BASE}/preferences`, prefs);
}

// ── Default Preferences ───────────────────────────────────────────────────────

/**
 * Build a sensible default preferences object when the API isn't available.
 * All in-app notifications are on; email is on for high-priority categories;
 * SMS and push default to off.
 */
function buildDefaultPreferences(): NotificationPreferences {
  const highPriorityCategories: NotificationCategory[] = [
    'leave',
    'payroll',
    'compliance',
    'approval',
    'alert',
  ];

  const preferences: CategoryPreference[] = (
    Object.keys(CATEGORY_META) as NotificationCategory[]
  ).map((category) => {
    const isHighPriority = highPriorityCategories.includes(category);
    const meta = CATEGORY_META[category];

    return {
      category,
      label: meta.label,
      description: meta.description,
      channels: [
        { channel: 'in-app', enabled: true },
        { channel: 'email', enabled: isHighPriority },
        { channel: 'push', enabled: false },
        { channel: 'sms', enabled: false },
      ],
    };
  });

  return {
    userId: '',
    preferences,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Group an array of notifications by calendar date label
 * (Today, Yesterday, This Week, Earlier).
 */
export function groupNotificationsByDate(
  notifications: Notification[]
): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    if (d >= todayStart) {
      groups.Today.push(n);
    } else if (d >= yesterdayStart) {
      groups.Yesterday.push(n);
    } else if (d >= weekStart) {
      groups['This Week'].push(n);
    } else {
      groups.Earlier.push(n);
    }
  }

  return groups;
}

/**
 * Format a notification timestamp as a relative string.
 * e.g. "2 hours ago", "3 days ago"
 */
export function formatNotificationTime(createdAt: string): string {
  const created = new Date(createdAt);
  const diffMs = Date.now() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return `${m} minute${m > 1 ? 's' : ''} ago`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return `${h} hour${h > 1 ? 's' : ''} ago`;
  }
  if (diffSec < 604800) {
    const d = Math.floor(diffSec / 86400);
    return `${d} day${d > 1 ? 's' : ''} ago`;
  }

  return created.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
