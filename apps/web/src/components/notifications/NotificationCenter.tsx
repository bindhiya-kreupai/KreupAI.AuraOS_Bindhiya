'use client';

/**
 * @module NotificationCenter
 * @description Dropdown panel showing the current user's notifications,
 *   grouped by date, with mark-all-read and clear actions.
 *   Integrates with notificationService and Socket.IO real-time updates.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Loader2,
  SlidersHorizontal,
  RefreshCw,
  InboxIcon,
} from 'lucide-react';
import NotificationItem from './NotificationItem';
import type { Notification, NotificationCategory } from '@/services/notificationService';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  clearReadNotifications,
  groupNotificationsByDate,
} from '@/services/notificationService';
import { useSocketContext } from '@/providers/SocketProvider';

// ── Category filter options ────────────────────────────────────────────────────

const FILTER_OPTIONS: { label: string; value: NotificationCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Approvals', value: 'approval' },
  { label: 'Leave', value: 'leave' },
  { label: 'Payroll', value: 'payroll' },
  { label: 'Alerts', value: 'alert' },
  { label: 'Announcements', value: 'announcement' },
  { label: 'Recognition', value: 'recognition' },
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface NotificationCenterProps {
  /** Called when the user clicks "Preferences" gear. */
  onOpenPreferences?: () => void;
  /** Called when the badge count changes so the header can update. */
  onUnreadCountChange?: (count: number) => void;
  /** Close the panel (if rendered in a portal/dropdown). */
  onClose?: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function NotificationCenter({
  onOpenPreferences,
  onUnreadCountChange,
  onClose,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'all'>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocketContext();

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(
    async (opts: { reset?: boolean; silent?: boolean } = {}) => {
      const { reset = false, silent = false } = opts;
      const pageToFetch = reset ? 1 : page;

      if (!silent) {
        if (reset) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
      }

      try {
        const res = await getNotifications({
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          read: unreadOnly ? false : undefined,
          page: pageToFetch,
          pageSize: 25,
        });

        const items = res.items;
        setNotifications((prev) => (reset ? items : [...prev, ...items]));
        setHasMore(items.length === 25);
        setTotalUnread(res.unreadCount);
        onUnreadCountChange?.(res.unreadCount);
        if (reset) setPage(1);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [categoryFilter, unreadOnly, page, onUnreadCountChange]
  );

  // Initial load + filter changes
  useEffect(() => {
    fetchNotifications({ reset: true });
  }, [categoryFilter, unreadOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time new notification via Socket.IO ───────────────────────────────

  useEffect(() => {
    if (!socket) return;

    const handler = (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
      setTotalUnread((n) => n + 1);
      onUnreadCountChange?.(totalUnread + 1);
    };

    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  }, [socket, totalUnread, onUnreadCountChange]);

  // ── Close on outside click ─────────────────────────────────────────────────

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onClose]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
    );
    setTotalUnread((c) => Math.max(0, c - 1));
    onUnreadCountChange?.(Math.max(0, totalUnread - 1));
    await markAsRead(id).catch(() => {});
  };

  const handleDelete = (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.read) {
      setTotalUnread((c) => Math.max(0, c - 1));
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setTotalUnread(0);
    onUnreadCountChange?.(0);
    await markAllRead().catch(() => {});
  };

  const handleClearRead = async () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
    await clearReadNotifications().catch(() => {});
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const res = await getNotifications({
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      read: unreadOnly ? false : undefined,
      page: nextPage,
      pageSize: 25,
    });
    setNotifications((prev) => [...prev, ...res.items]);
    setHasMore(res.items.length === 25);
  };

  // ── Grouped display ───────────────────────────────────────────────────────

  const grouped = groupNotificationsByDate(notifications);
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'] as const;
  const nonEmpty = groupOrder.filter((g) => grouped[g]?.length > 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={panelRef}
      className="w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl shadow-xl overflow-hidden flex flex-col"
      style={{ maxHeight: '80vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/30">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-celestial-indigo" />
          <span className="font-bold text-ink-black dark:text-pearl text-sm">Notifications</span>
          {totalUnread > 0 && (
            <span className="px-1.5 py-0.5 bg-celestial-indigo text-white text-[10px] font-bold rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => fetchNotifications({ reset: true, silent: true })}
            disabled={refreshing}
            className="p-1.5 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-gray-100 dark:hover:bg-deep-cosmos/50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {onOpenPreferences && (
            <button
              onClick={onOpenPreferences}
              className="p-1.5 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-gray-100 dark:hover:bg-deep-cosmos/50 transition-colors"
              title="Notification preferences"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-cloud dark:border-nebula-purple/30 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setCategoryFilter(opt.value)}
            className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
              categoryFilter === opt.value
                ? 'bg-celestial-indigo text-white'
                : 'bg-gray-100 dark:bg-deep-cosmos text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setUnreadOnly((v) => !v)}
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
            unreadOnly
              ? 'bg-celestial-indigo/20 text-celestial-indigo border border-celestial-indigo/40'
              : 'bg-gray-100 dark:bg-deep-cosmos text-silver-mist hover:text-ink-black dark:hover:text-pearl'
          }`}
        >
          Unread only
        </button>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader2 className="w-5 h-5 text-celestial-indigo animate-spin" />
            <span className="text-sm text-silver-mist">Loading…</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
            <InboxIcon className="w-10 h-10 text-silver-mist/50" />
            <p className="text-sm font-medium text-silver-mist">No notifications</p>
            <p className="text-xs text-silver-mist">
              {unreadOnly ? "You're all caught up!" : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          <div>
            {nonEmpty.map((group) => (
              <div key={group}>
                <div className="px-4 py-1.5 bg-gray-50 dark:bg-deep-cosmos/50 border-b border-cloud dark:border-nebula-purple/20">
                  <span className="text-[10px] font-semibold text-silver-mist uppercase tracking-wide">
                    {group}
                  </span>
                </div>
                <div className="divide-y divide-cloud dark:divide-nebula-purple/10">
                  {grouped[group].map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkRead={handleMarkRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="py-3 text-center">
                <button
                  onClick={handleLoadMore}
                  className="text-xs text-celestial-indigo hover:underline font-medium"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-cloud dark:border-nebula-purple/30 flex items-center justify-between">
          <button
            onClick={handleMarkAllRead}
            disabled={totalUnread === 0}
            className="flex items-center gap-1.5 text-xs font-medium text-celestial-indigo hover:text-celestial-indigo/80 disabled:opacity-50 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
          <button
            onClick={handleClearRead}
            className="flex items-center gap-1.5 text-xs font-medium text-silver-mist hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear read
          </button>
        </div>
      )}
    </div>
  );
}
