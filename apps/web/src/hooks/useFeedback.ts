/**
 * @module useFeedback
 * @description React hook for continuous feedback — API-backed state, CRUD,
 *              filtering, reactions, and comments (real persistence).
 * @project AURA HCM Platform
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FeedbackService } from '@/services/feedbackService';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import type {
  FeedbackItem,
  FeedbackFormData,
  FeedbackFilters,
  FeedbackStats,
  FeedbackCategory,
  FeedbackComment,
} from '@/services/feedbackService';

const EMPTY_STATS: FeedbackStats = {
  totalGiven: 0,
  totalReceived: 0,
  praiseCount: 0,
  constructiveCount: 0,
  suggestionCount: 0,
  anonymousCount: 0,
  streak: 0,
  topTags: [],
};

// ── Hook ─────────────────────────────────────────────────────────────────────────

export const useFeedback = () => {
  const { user } = useCurrentUser();
  const currentEmployeeId = user?.employeeId ?? user?.userId ?? '';

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats>(EMPTY_STATS);
  const [filters, setFilters] = useState<FeedbackFilters>({
    category: 'all',
    visibility: 'all',
    direction: 'all',
    search: '',
    dateRange: 'all',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [items, statsData] = await Promise.all([
        FeedbackService.getFeedback(),
        FeedbackService.getStats(),
      ]);
      setFeedbackItems(items);
      setStats(statsData);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load feedback');
      setFeedbackItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Client-side filtering over the loaded set (server returns tenant-scoped rows).
  const filteredItems = useMemo(() => {
    let items = [...feedbackItems];

    if (filters.category && filters.category !== 'all') {
      items = items.filter((i) => i.category === filters.category);
    }
    if (filters.visibility && filters.visibility !== 'all') {
      items = items.filter((i) => i.visibility === filters.visibility);
    }
    if (filters.direction === 'received') {
      items = items.filter((i) => i.toId === currentEmployeeId);
    } else if (filters.direction === 'given') {
      items = items.filter((i) => i.fromId === currentEmployeeId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.message.toLowerCase().includes(q) ||
          i.fromName.toLowerCase().includes(q) ||
          i.toName.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      switch (filters.dateRange) {
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoff.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
      }
      items = items.filter((i) => new Date(i.createdAt) >= cutoff);
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [feedbackItems, filters, currentEmployeeId]);

  const createFeedback = useCallback(
    async (data: FeedbackFormData) => {
      setIsSaving(true);
      setError(null);
      try {
        await FeedbackService.createFeedback(data);
        await load();
      } catch (e: any) {
        setError(e?.message ?? 'Failed to submit feedback');
        throw e;
      } finally {
        setIsSaving(false);
      }
    },
    [load]
  );

  const toggleReaction = useCallback(
    async (feedbackId: string, type: string) => {
      // Optimistic update, then reconcile from the server response.
      setFeedbackItems((prev) =>
        prev.map((item) => {
          if (item.id !== feedbackId) return item;
          const existing = item.reactions.find((r) => r.type === type);
          if (existing) {
            return {
              ...item,
              reactions: item.reactions
                .map((r) =>
                  r.type === type
                    ? {
                        ...r,
                        count: r.hasReacted ? r.count - 1 : r.count + 1,
                        hasReacted: !r.hasReacted,
                      }
                    : r
                )
                .filter((r) => r.count > 0),
            };
          }
          return {
            ...item,
            reactions: [
              ...item.reactions,
              { type: type as FeedbackItem['reactions'][0]['type'], count: 1, hasReacted: true },
            ],
          };
        })
      );
      try {
        const res = await FeedbackService.addReaction(feedbackId, type);
        setFeedbackItems((prev) =>
          prev.map((item) => {
            if (item.id !== feedbackId) return item;
            const others = item.reactions.filter((r) => r.type !== type);
            return {
              ...item,
              reactions:
                res.count > 0
                  ? [
                      ...others,
                      {
                        type: type as FeedbackItem['reactions'][0]['type'],
                        count: res.count,
                        hasReacted: res.hasReacted,
                      },
                    ]
                  : others,
            };
          })
        );
      } catch (e: any) {
        setError(e?.message ?? 'Failed to react');
        await load();
      }
    },
    [load]
  );

  const addComment = useCallback(async (feedbackId: string, body: string) => {
    try {
      const comment = await FeedbackService.addComment(feedbackId, body);
      setFeedbackItems((prev) =>
        prev.map((item) =>
          item.id === feedbackId ? { ...item, comments: [...item.comments, comment] } : item
        )
      );
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add comment');
      throw e;
    }
  }, []);

  const updateFilters = useCallback((update: Partial<FeedbackFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
  }, []);

  return {
    feedbackItems: filteredItems,
    allItems: feedbackItems,
    stats,
    filters,
    isLoading,
    isSaving,
    error,
    refresh: load,
    createFeedback,
    toggleReaction,
    addComment,
    updateFilters,
  };
};

// Re-export types for convenience
export type {
  FeedbackItem,
  FeedbackFormData,
  FeedbackFilters,
  FeedbackStats,
  FeedbackCategory,
  FeedbackComment,
};
export type { FeedbackVisibility } from '@/services/feedbackService';
