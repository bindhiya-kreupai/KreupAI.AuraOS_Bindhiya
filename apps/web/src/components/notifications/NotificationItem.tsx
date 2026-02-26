'use client';

/**
 * @module NotificationItem
 * @description Individual notification row — icon, subject, time, read state,
 *   and action link. Supports marking as read on click and deletion.
 */

import React from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  Shield,
  Megaphone,
  CheckSquare,
  Settings,
  Star,
  AlertTriangle,
  Bell,
  X,
  ExternalLink,
} from 'lucide-react';
import type { Notification, NotificationCategory } from '@/services/notificationService';
import { formatNotificationTime } from '@/services/notificationService';

// ── Category → Icon mapping ────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<NotificationCategory, React.ElementType> = {
  leave: Calendar,
  payroll: DollarSign,
  performance: TrendingUp,
  onboarding: UserPlus,
  compliance: Shield,
  announcement: Megaphone,
  approval: CheckSquare,
  system: Settings,
  recognition: Star,
  alert: AlertTriangle,
};

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  leave: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  payroll: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
  performance: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  onboarding: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600',
  compliance: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
  announcement: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
  approval: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600',
  system: 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400',
  recognition: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
  alert: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600',
};

// ── Priority indicator ─────────────────────────────────────────────────────────

const PRIORITY_INDICATORS: Record<string, string> = {
  urgent: 'bg-rose-500',
  high: 'bg-amber-500',
  normal: 'bg-celestial-indigo',
  low: '',
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const Icon = CATEGORY_ICONS[notification.category] ?? Bell;
  const iconColor = CATEGORY_COLORS[notification.category] ?? CATEGORY_COLORS.system;
  const priorityDot = PRIORITY_INDICATORS[notification.priority];

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead?.(notification.id);
    }
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_self');
    }
  };

  return (
    <div
      className={`group relative flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-deep-cosmos/40 transition-colors cursor-pointer ${
        !notification.read ? 'bg-celestial-indigo/3' : ''
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${notification.read ? '' : 'Unread: '}${notification.subject}`}
    >
      {/* Unread indicator dot */}
      {!notification.read && (
        <span
          aria-hidden
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-celestial-indigo"
        />
      )}

      {/* Category icon */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${
              notification.read
                ? 'text-silver-mist'
                : 'font-semibold text-ink-black dark:text-pearl'
            }`}
          >
            {notification.subject}
          </p>
          {/* Priority dot */}
          {priorityDot && (
            <span
              aria-label={`${notification.priority} priority`}
              className={`shrink-0 mt-1.5 w-2 h-2 rounded-full ${priorityDot}`}
            />
          )}
        </div>

        {notification.body && (
          <p className="text-xs text-silver-mist mt-0.5 line-clamp-2">{notification.body}</p>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-silver-mist">
            {formatNotificationTime(notification.createdAt)}
          </span>
          {notification.actionUrl && (
            <span className="flex items-center gap-0.5 text-[10px] text-celestial-indigo">
              <ExternalLink className="w-2.5 h-2.5" />
              View
            </span>
          )}
        </div>
      </div>

      {/* Delete button (visible on hover) */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/20 text-silver-mist hover:text-rose-500 transition-all"
          aria-label="Delete notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
