/**
 * @module useFeedback
 * @description React hook for continuous feedback — manages state, CRUD,
 *              filtering, reactions, and stats with mock data fallback
 * @project AURA HCM Platform
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FeedbackService } from '@/services/feedbackService';
import type {
  FeedbackItem,
  FeedbackFormData,
  FeedbackFilters,
  FeedbackStats,
  FeedbackCategory,
  FeedbackComment,
} from '@/services/feedbackService';

// ── Mock Data ────────────────────────────────────────────────────────────────────

const MOCK_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-1',
    category: 'praise',
    visibility: 'public',
    status: 'active',
    fromId: 'emp-201',
    fromName: 'Michael Torres',
    fromRole: 'Engineering Manager',
    fromDepartment: 'Engineering',
    toId: 'emp-100',
    toName: 'You',
    toRole: 'Senior Software Engineer',
    toDepartment: 'Engineering',
    message:
      'Excellent work on the API migration! Your attention to backward compatibility saved us from multiple breaking changes. The documentation you wrote was also top-notch.',
    tags: ['Technical Excellence', 'Documentation', 'Reliability'],
    reactions: [
      { type: '👏', count: 8, hasReacted: false },
      { type: '🔥', count: 3, hasReacted: true },
    ],
    comments: [
      {
        id: 'c-1',
        authorId: 'emp-202',
        authorName: 'Lisa Park',
        authorRole: 'Tech Lead',
        body: 'Totally agree — the migration was seamless!',
        createdAt: '2026-02-22T14:00:00Z',
      },
    ],
    createdAt: '2026-02-22T10:30:00Z',
    updatedAt: '2026-02-22T14:00:00Z',
  },
  {
    id: 'fb-2',
    category: 'constructive',
    visibility: 'private',
    status: 'active',
    fromId: 'emp-201',
    fromName: 'Michael Torres',
    fromRole: 'Engineering Manager',
    fromDepartment: 'Engineering',
    toId: 'emp-100',
    toName: 'You',
    toRole: 'Senior Software Engineer',
    toDepartment: 'Engineering',
    message:
      'During the sprint planning, I noticed you could be more concise when presenting estimates. Consider focusing on the key decision points and risks rather than covering every detail.',
    tags: ['Communication', 'Presentation'],
    reactions: [],
    comments: [],
    createdAt: '2026-02-20T16:00:00Z',
    updatedAt: '2026-02-20T16:00:00Z',
  },
  {
    id: 'fb-3',
    category: 'suggestion',
    visibility: 'public',
    status: 'active',
    fromId: 'emp-203',
    fromName: 'Anika Shah',
    fromRole: 'Product Designer',
    fromDepartment: 'Design',
    toId: 'emp-100',
    toName: 'You',
    toRole: 'Senior Software Engineer',
    toDepartment: 'Engineering',
    message:
      'It would be great if we could pair more on the UI implementation early in the sprint. Having eng input during the design phase helps us avoid rework. Maybe a 30-min weekly sync?',
    tags: ['Collaboration', 'Process Improvement'],
    reactions: [
      { type: '💡', count: 5, hasReacted: false },
      { type: '👏', count: 2, hasReacted: false },
    ],
    comments: [],
    linkedGoalId: 'goal-7',
    linkedGoalTitle: 'Improve cross-team collaboration',
    createdAt: '2026-02-19T09:15:00Z',
    updatedAt: '2026-02-19T09:15:00Z',
  },
  {
    id: 'fb-4',
    category: 'praise',
    visibility: 'anonymous',
    status: 'active',
    fromId: 'anon',
    fromName: 'Anonymous',
    fromRole: '',
    fromDepartment: '',
    toId: 'emp-100',
    toName: 'You',
    toRole: 'Senior Software Engineer',
    toDepartment: 'Engineering',
    message:
      'You always make time to help others debug issues, even when you are busy with your own work. That kind of generosity makes the whole team stronger.',
    tags: ['Teamwork', 'Mentoring'],
    reactions: [
      { type: '❤️', count: 12, hasReacted: false },
      { type: '🙏', count: 6, hasReacted: false },
    ],
    comments: [],
    createdAt: '2026-02-18T11:00:00Z',
    updatedAt: '2026-02-18T11:00:00Z',
  },
  {
    id: 'fb-5',
    category: 'praise',
    visibility: 'public',
    status: 'active',
    fromId: 'emp-100',
    fromName: 'You',
    fromRole: 'Senior Software Engineer',
    fromDepartment: 'Engineering',
    toId: 'emp-204',
    toName: 'Jordan Lee',
    toRole: 'QA Engineer',
    toDepartment: 'Engineering',
    message:
      'Jordan, your test automation suite caught a critical regression in the payments module before it reached staging. Your thoroughness is incredible — thank you!',
    tags: ['Quality', 'Proactiveness', 'Technical Excellence'],
    reactions: [
      { type: '👏', count: 4, hasReacted: true },
      { type: '🔥', count: 2, hasReacted: false },
    ],
    comments: [
      {
        id: 'c-2',
        authorId: 'emp-204',
        authorName: 'Jordan Lee',
        authorRole: 'QA Engineer',
        body: 'Thanks! The new test framework made it much easier to catch.',
        createdAt: '2026-02-17T15:30:00Z',
      },
    ],
    createdAt: '2026-02-17T14:00:00Z',
    updatedAt: '2026-02-17T15:30:00Z',
  },
  {
    id: 'fb-6',
    category: 'constructive',
    visibility: 'anonymous',
    status: 'active',
    fromId: 'anon',
    fromName: 'Anonymous',
    fromRole: '',
    fromDepartment: '',
    toId: 'emp-100',
    toName: 'You',
    toRole: 'Senior Software Engineer',
    toDepartment: 'Engineering',
    message:
      'During code reviews, it would help to provide more actionable suggestions instead of just pointing out issues. A brief "consider doing X instead" goes a long way.',
    tags: ['Code Review', 'Communication'],
    reactions: [{ type: '💡', count: 3, hasReacted: false }],
    comments: [],
    createdAt: '2026-02-15T08:45:00Z',
    updatedAt: '2026-02-15T08:45:00Z',
  },
  {
    id: 'fb-7',
    category: 'suggestion',
    visibility: 'public',
    status: 'active',
    fromId: 'emp-100',
    fromName: 'You',
    fromRole: 'Senior Software Engineer',
    fromDepartment: 'Engineering',
    toId: 'emp-205',
    toName: 'Rachel Green',
    toRole: 'DevOps Engineer',
    toDepartment: 'Engineering',
    message:
      'It would be helpful to add deployment rollback documentation to the runbook. When the last incident happened, we lost time figuring out the rollback procedure.',
    tags: ['Documentation', 'Process Improvement', 'Incident Response'],
    reactions: [{ type: '💡', count: 7, hasReacted: true }],
    comments: [],
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'fb-8',
    category: 'praise',
    visibility: 'public',
    status: 'active',
    fromId: 'emp-206',
    fromName: 'Carlos Rivera',
    fromRole: 'Product Manager',
    fromDepartment: 'Product',
    toId: 'emp-100',
    toName: 'You',
    toRole: 'Senior Software Engineer',
    toDepartment: 'Engineering',
    message:
      'Thanks for proactively flagging the scope creep risk in the dashboard project. Your early heads-up allowed us to re-prioritize and stay on track.',
    tags: ['Proactiveness', 'Communication', 'Leadership'],
    reactions: [
      { type: '👏', count: 6, hasReacted: false },
      { type: '🔥', count: 4, hasReacted: false },
    ],
    comments: [],
    createdAt: '2026-02-12T13:20:00Z',
    updatedAt: '2026-02-12T13:20:00Z',
  },
];

const MOCK_STATS: FeedbackStats = {
  totalGiven: 14,
  totalReceived: 23,
  praiseCount: 15,
  constructiveCount: 5,
  suggestionCount: 3,
  anonymousCount: 4,
  streak: 7,
  topTags: [
    { tag: 'Technical Excellence', count: 8 },
    { tag: 'Communication', count: 6 },
    { tag: 'Teamwork', count: 5 },
    { tag: 'Leadership', count: 4 },
    { tag: 'Process Improvement', count: 3 },
  ],
};

// ── Hook ─────────────────────────────────────────────────────────────────────────

export const useFeedback = () => {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats>(MOCK_STATS);
  const [filters, setFilters] = useState<FeedbackFilters>({
    category: 'all',
    visibility: 'all',
    direction: 'all',
    search: '',
    dateRange: 'all',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [items, statsData] = await Promise.all([
          FeedbackService.getFeedback(filters),
          FeedbackService.getStats(),
        ]);
        setFeedbackItems(items.length > 0 ? items : MOCK_FEEDBACK);
        if (statsData.totalGiven > 0 || statsData.totalReceived > 0) {
          setStats(statsData);
        }
      } catch {
        setFeedbackItems(MOCK_FEEDBACK);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered items
  const filteredItems = useMemo(() => {
    let items = [...feedbackItems];

    if (filters.category && filters.category !== 'all') {
      items = items.filter((i) => i.category === filters.category);
    }
    if (filters.visibility && filters.visibility !== 'all') {
      items = items.filter((i) => i.visibility === filters.visibility);
    }
    if (filters.direction === 'received') {
      items = items.filter((i) => i.toId === 'emp-100');
    } else if (filters.direction === 'given') {
      items = items.filter((i) => i.fromId === 'emp-100');
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
  }, [feedbackItems, filters]);

  // Create feedback
  const createFeedback = useCallback(async (data: FeedbackFormData) => {
    setIsSaving(true);
    try {
      const created = await FeedbackService.createFeedback(data);
      setFeedbackItems((prev) => [created, ...prev]);
    } catch {
      // Mock: add locally
      const newItem: FeedbackItem = {
        id: `fb-new-${Date.now()}`,
        category: data.category,
        visibility: data.visibility,
        status: 'active',
        fromId: 'emp-100',
        fromName: 'You',
        fromRole: 'Senior Software Engineer',
        fromDepartment: 'Engineering',
        toId: data.toId,
        toName: data.toName,
        toRole: '',
        toDepartment: '',
        message: data.message,
        tags: data.tags,
        reactions: [],
        comments: [],
        linkedGoalId: data.linkedGoalId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFeedbackItems((prev) => [newItem, ...prev]);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Toggle reaction
  const toggleReaction = useCallback(async (feedbackId: string, type: string) => {
    setFeedbackItems((prev) =>
      prev.map((item) => {
        if (item.id !== feedbackId) return item;
        const existing = item.reactions.find((r) => r.type === type);
        if (existing) {
          return {
            ...item,
            reactions: item.reactions.map((r) =>
              r.type === type
                ? {
                    ...r,
                    count: r.hasReacted ? r.count - 1 : r.count + 1,
                    hasReacted: !r.hasReacted,
                  }
                : r
            ),
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
  }, []);

  // Add comment
  const addComment = useCallback(async (feedbackId: string, body: string) => {
    const comment: FeedbackComment = {
      id: `c-new-${Date.now()}`,
      authorId: 'emp-100',
      authorName: 'You',
      authorRole: 'Senior Software Engineer',
      body,
      createdAt: new Date().toISOString(),
    };
    setFeedbackItems((prev) =>
      prev.map((item) =>
        item.id === feedbackId ? { ...item, comments: [...item.comments, comment] } : item
      )
    );
  }, []);

  // Update filters
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
