'use client';

/**
 * @module NotificationBadge
 * @description Unread notification count badge for the app header.
 *   Polls the unread count API every 60 seconds and also subscribes to
 *   real-time updates via the SocketProvider if available.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadCount } from '@/services/notificationService';
import { useSocketContext } from '@/providers/SocketProvider';

interface NotificationBadgeProps {
  /** Called when the bell icon is clicked — open the NotificationCenter. */
  onClick?: () => void;
  /** Override the unread count (e.g. from a parent query). */
  count?: number;
  /** Polling interval in ms. Default 60 000. Set to 0 to disable polling. */
  pollIntervalMs?: number;
}

export default function NotificationBadge({
  onClick,
  count: externalCount,
  pollIntervalMs = 60_000,
}: NotificationBadgeProps) {
  const [internalCount, setInternalCount] = useState(0);
  const { socket } = useSocketContext();

  const count = externalCount !== undefined ? externalCount : internalCount;

  const refresh = useCallback(async () => {
    const n = await getUnreadCount();
    setInternalCount(n);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (externalCount === undefined) {
      refresh();
    }
  }, [externalCount, refresh]);

  // Polling
  useEffect(() => {
    if (externalCount !== undefined || pollIntervalMs <= 0) return;

    const id = setInterval(refresh, pollIntervalMs);
    return () => clearInterval(id);
  }, [externalCount, pollIntervalMs, refresh]);

  // Real-time via Socket.IO
  useEffect(() => {
    if (!socket || externalCount !== undefined) return;

    const handler = () => {
      setInternalCount((prev) => prev + 1);
    };

    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  }, [socket, externalCount]);

  const displayCount = Math.min(count, 99);

  return (
    <button
      onClick={onClick}
      aria-label={count > 0 ? `Notifications — ${count} unread` : 'Notifications'}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-deep-cosmos/60 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors focus:outline-none focus:ring-2 focus:ring-celestial-indigo/40"
    >
      <Bell className="w-5 h-5" />

      {count > 0 && (
        <span
          aria-hidden
          className={`absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-rose-500 text-white font-bold leading-none ring-2 ring-white dark:ring-deep-cosmos ${
            displayCount > 9
              ? 'min-w-[18px] h-[18px] text-[9px] px-1'
              : 'w-[16px] h-[16px] text-[9px]'
          }`}
        >
          {displayCount}
          {count > 99 && '+'}
        </span>
      )}
    </button>
  );
}
