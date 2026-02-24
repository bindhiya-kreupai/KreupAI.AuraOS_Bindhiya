/**
 * @module PraiseWall
 * @description Public praise wall for performance-linked recognition —
 *              shoutouts tied to goals/values, reactions, and team highlights
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Megaphone,
  MessageSquare,
  Star,
  Target,
  Users,
  Lightbulb,
  Shield,
  Trophy,
  Sparkles,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

type PraiseCategory =
  | 'goal_achieved'
  | 'above_beyond'
  | 'collaboration'
  | 'innovation'
  | 'mentoring'
  | 'leadership';

interface PraiseReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface PraiseComment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: string;
}

export interface PraisePost {
  id: string;
  authorName: string;
  authorRole: string;
  authorDepartment: string;
  recipientName: string;
  recipientRole: string;
  recipientDepartment: string;
  message: string;
  category: PraiseCategory;
  linkedGoal?: string;
  isTeamPraise: boolean;
  teamMembers?: string[];
  reactions: PraiseReaction[];
  comments: PraiseComment[];
  createdAt: string;
  isPinned: boolean;
}

export interface PraiseWallProps {
  posts: PraisePost[];
}

// ── Config ───────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  PraiseCategory,
  { label: string; icon: LucideIcon; color: string; bg: string; emoji: string }
> = {
  goal_achieved: {
    label: 'Goal Achieved',
    icon: Target,
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
    emoji: '🎯',
  },
  above_beyond: {
    label: 'Above & Beyond',
    icon: Star,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
    emoji: '⭐',
  },
  collaboration: {
    label: 'Collaboration',
    icon: Users,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
    emoji: '🤝',
  },
  innovation: {
    label: 'Innovation',
    icon: Lightbulb,
    color: 'text-nebula-purple',
    bg: 'bg-nebula-purple/10',
    emoji: '💡',
  },
  mentoring: {
    label: 'Mentoring',
    icon: Shield,
    color: 'text-quantum-rose',
    bg: 'bg-quantum-rose/10',
    emoji: '🎓',
  },
  leadership: {
    label: 'Leadership',
    icon: Trophy,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
    emoji: '🏆',
  },
};

const REACTION_EMOJIS = ['👏', '❤️', '🔥', '⭐', '💪'];

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_PRAISE_POSTS: PraisePost[] = [
  {
    id: 'pp-1',
    authorName: 'Sarah Chen',
    authorRole: 'Engineering Manager',
    authorDepartment: 'Engineering',
    recipientName: 'David Kim',
    recipientRole: 'Senior Engineer',
    recipientDepartment: 'Engineering',
    message:
      'Incredible work on the API performance overhaul! You reduced response times by 60% and hit our Q1 reliability goal ahead of schedule. The whole backend team benefited from your systematic approach and thorough documentation.',
    category: 'goal_achieved',
    linkedGoal: 'Q1: Improve API P95 latency to <200ms',
    isTeamPraise: false,
    reactions: [
      { emoji: '👏', count: 12, hasReacted: true },
      { emoji: '🔥', count: 8, hasReacted: false },
      { emoji: '⭐', count: 5, hasReacted: false },
    ],
    comments: [
      {
        id: 'c-1',
        authorName: 'Lisa Park',
        authorRole: 'Staff Engineer',
        content: 'Well deserved! That caching layer you designed is brilliant.',
        timestamp: '2026-02-24T09:30:00',
      },
      {
        id: 'c-2',
        authorName: 'Jordan Lee',
        authorRole: 'Backend Engineer',
        content: 'Learned so much from pairing with you on this project 🙌',
        timestamp: '2026-02-24T10:15:00',
      },
    ],
    createdAt: '2026-02-24T08:00:00',
    isPinned: true,
  },
  {
    id: 'pp-2',
    authorName: 'Michael Torres',
    authorRole: 'Product Lead',
    authorDepartment: 'Product',
    recipientName: 'Platform Team',
    recipientRole: '',
    recipientDepartment: 'Engineering',
    message:
      'Huge shoutout to the entire Platform Team for the successful migration to the new infrastructure! Zero downtime, zero customer impact, and completed a week early. This is what world-class engineering looks like.',
    category: 'above_beyond',
    isTeamPraise: true,
    teamMembers: ['Anika Shah', 'Carlos Rivera', 'Elena Rodriguez', 'Priya Patel'],
    reactions: [
      { emoji: '👏', count: 24, hasReacted: false },
      { emoji: '❤️', count: 15, hasReacted: true },
      { emoji: '🔥', count: 11, hasReacted: false },
      { emoji: '💪', count: 7, hasReacted: false },
    ],
    comments: [
      {
        id: 'c-3',
        authorName: 'CTO Office',
        authorRole: 'Leadership',
        content: 'Outstanding work. This sets a new standard for infrastructure projects.',
        timestamp: '2026-02-23T14:00:00',
      },
    ],
    createdAt: '2026-02-23T11:00:00',
    isPinned: false,
  },
  {
    id: 'pp-3',
    authorName: 'Anika Shah',
    authorRole: 'Design Lead',
    authorDepartment: 'Design',
    recipientName: 'Rachel Green',
    recipientRole: 'Junior Engineer',
    recipientDepartment: 'Engineering',
    message:
      "Rachel jumped in to help with the design system migration even though it wasn't her sprint commitment. She proactively identified accessibility gaps and fixed 15 components. Her initiative saved us a full sprint of work!",
    category: 'collaboration',
    isTeamPraise: false,
    reactions: [
      { emoji: '👏', count: 9, hasReacted: false },
      { emoji: '❤️', count: 6, hasReacted: false },
      { emoji: '⭐', count: 4, hasReacted: true },
    ],
    comments: [],
    createdAt: '2026-02-22T16:30:00',
    isPinned: false,
  },
  {
    id: 'pp-4',
    authorName: 'Carlos Rivera',
    authorRole: 'Product Manager',
    authorDepartment: 'Product',
    recipientName: 'Elena Rodriguez',
    recipientRole: 'Senior Engineer',
    recipientDepartment: 'Engineering',
    message:
      "Elena's AI-powered search prototype blew everyone away at the demo day! She independently researched vector embeddings, built a working POC in 2 weeks, and presented it to the executive team. Innovation at its finest.",
    category: 'innovation',
    linkedGoal: 'Q1: Explore AI-powered product features',
    isTeamPraise: false,
    reactions: [
      { emoji: '🔥', count: 18, hasReacted: false },
      { emoji: '👏', count: 14, hasReacted: true },
      { emoji: '💪', count: 6, hasReacted: false },
    ],
    comments: [
      {
        id: 'c-4',
        authorName: 'VP Engineering',
        authorRole: 'Leadership',
        content: "This could be a game-changer for our product. Let's schedule a deep dive.",
        timestamp: '2026-02-21T11:00:00',
      },
    ],
    createdAt: '2026-02-21T09:00:00',
    isPinned: false,
  },
  {
    id: 'pp-5',
    authorName: 'Jordan Lee',
    authorRole: 'Backend Engineer',
    authorDepartment: 'Engineering',
    recipientName: 'David Kim',
    recipientRole: 'Senior Engineer',
    recipientDepartment: 'Engineering',
    message:
      'David has been an incredible mentor during my first 6 months. He set up weekly pairing sessions, gave me space to make mistakes, and always took time to explain the "why" behind decisions. I\'ve grown more in 6 months than I did in 2 years at my previous job.',
    category: 'mentoring',
    isTeamPraise: false,
    reactions: [
      { emoji: '❤️', count: 20, hasReacted: false },
      { emoji: '👏', count: 12, hasReacted: false },
      { emoji: '⭐', count: 8, hasReacted: true },
    ],
    comments: [
      {
        id: 'c-5',
        authorName: 'Sarah Chen',
        authorRole: 'Eng Manager',
        content:
          'David is a force multiplier for the team. This kind of mentoring is what makes us great.',
        timestamp: '2026-02-20T15:00:00',
      },
    ],
    createdAt: '2026-02-20T10:00:00',
    isPinned: false,
  },
  {
    id: 'pp-6',
    authorName: 'Lisa Park',
    authorRole: 'Staff Engineer',
    authorDepartment: 'Engineering',
    recipientName: 'Sarah Chen',
    recipientRole: 'Engineering Manager',
    recipientDepartment: 'Engineering',
    message:
      'Sarah navigated the team through the reorg with grace and transparency. She kept everyone informed, fought for the right team structure, and made sure nobody felt left behind. True leadership under pressure.',
    category: 'leadership',
    isTeamPraise: false,
    reactions: [
      { emoji: '❤️', count: 16, hasReacted: true },
      { emoji: '👏', count: 10, hasReacted: false },
      { emoji: '💪', count: 5, hasReacted: false },
    ],
    comments: [],
    createdAt: '2026-02-19T13:00:00',
    isPinned: false,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Component ────────────────────────────────────────────────────────────────────

export const PraiseWall: React.FC<PraiseWallProps> = ({ posts }) => {
  const [categoryFilter, setCategoryFilter] = useState<PraiseCategory | 'all'>('all');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [localPosts, setLocalPosts] = useState(posts);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const categories = useMemo(() => {
    const set = new Set<PraiseCategory>();
    posts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [posts]);

  const filtered = useMemo(() => {
    let list = localPosts;
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }
    // Pinned first, then by date
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [localPosts, categoryFilter]);

  const toggleComments = useCallback((postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }, []);

  const toggleReaction = useCallback((postId: string, emoji: string) => {
    setLocalPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const existing = p.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...p,
            reactions: p.reactions.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.hasReacted ? r.count - 1 : r.count + 1,
                    hasReacted: !r.hasReacted,
                  }
                : r
            ),
          };
        }
        return { ...p, reactions: [...p.reactions, { emoji, count: 1, hasReacted: true }] };
      })
    );
  }, []);

  const addComment = useCallback(
    (postId: string) => {
      const content = commentInputs[postId]?.trim();
      if (!content) return;
      const comment: PraiseComment = {
        id: `c-${Date.now()}`,
        authorName: 'You',
        authorRole: 'Team Member',
        content,
        timestamp: new Date().toISOString(),
      };
      setLocalPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p))
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    },
    [commentInputs]
  );

  // Stats
  const totalPraises = localPosts.length;
  const totalReactions = localPosts.reduce(
    (s, p) => s + p.reactions.reduce((rs, r) => rs + r.count, 0),
    0
  );
  const teamPraises = localPosts.filter((p) => p.isTeamPraise).length;

  return (
    <div className="space-y-3">
      {/* Stats Bar */}
      <div className="flex items-center gap-4 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-sunset-amber" />
          <div>
            <p className="text-[12px] font-black text-ink-black dark:text-pearl">{totalPraises}</p>
            <p className="text-[7px] text-silver-mist font-bold">Praises</p>
          </div>
        </div>
        <div className="w-px h-6 bg-cloud dark:bg-nebula-purple/20" />
        <div>
          <p className="text-[12px] font-black text-sunset-amber">{totalReactions}</p>
          <p className="text-[7px] text-silver-mist font-bold">Reactions</p>
        </div>
        <div className="w-px h-6 bg-cloud dark:bg-nebula-purple/20" />
        <div>
          <p className="text-[12px] font-black text-celestial-indigo">{teamPraises}</p>
          <p className="text-[7px] text-silver-mist font-bold">Team Praises</p>
        </div>
        <div className="flex-1" />

        {/* Category Filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2 py-1 rounded-md text-[8px] font-bold transition-colors ${
              categoryFilter === 'all'
                ? 'bg-celestial-indigo/10 text-celestial-indigo'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            All
          </button>
          {categories.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1 rounded-md text-[8px] font-bold transition-colors ${
                  categoryFilter === cat
                    ? `${cfg.bg} ${cfg.color}`
                    : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
                title={cfg.label}
              >
                {cfg.emoji}
              </button>
            );
          })}
        </div>
      </div>

      {/* Praise Posts */}
      <div className="space-y-2">
        {filtered.map((post) => {
          const catCfg = CATEGORY_CONFIG[post.category];
          const CatIcon = catCfg.icon;
          const showComments = expandedComments.has(post.id);

          return (
            <div
              key={post.id}
              className={`rounded-xl border overflow-hidden transition-colors ${
                post.isPinned
                  ? 'border-sunset-amber/30 bg-sunset-amber/5'
                  : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
              }`}
            >
              <div className="p-3">
                {/* Header */}
                <div className="flex items-start gap-2.5">
                  {/* Author Avatar */}
                  <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[9px] font-bold text-celestial-indigo shrink-0">
                    {getInitials(post.authorName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-ink-black dark:text-pearl">
                        {post.authorName}
                      </span>
                      <span className="text-[8px] text-silver-mist">praised</span>
                      <span className="text-[10px] font-bold text-celestial-indigo">
                        {post.recipientName}
                      </span>
                      {post.isPinned && <Sparkles className="w-3 h-3 text-sunset-amber" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[7px] text-silver-mist">
                        {post.authorRole} • {post.authorDepartment}
                      </span>
                      <span className="text-[7px] text-silver-mist flex items-center gap-0.5">
                        <Clock className="w-2 h-2" /> {timeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg shrink-0 ${catCfg.bg}`}
                  >
                    <CatIcon className={`w-3 h-3 ${catCfg.color}`} />
                    <span className={`text-[7px] font-bold ${catCfg.color}`}>{catCfg.label}</span>
                  </div>
                </div>

                {/* Message */}
                <p className="text-[9px] text-ink-black dark:text-pearl leading-relaxed mt-2 ml-10">
                  {post.message}
                </p>

                {/* Team Members */}
                {post.isTeamPraise && post.teamMembers && post.teamMembers.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 ml-10 flex-wrap">
                    <Users className="w-3 h-3 text-celestial-indigo" />
                    {post.teamMembers.map((member) => (
                      <span
                        key={member}
                        className="px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-celestial-indigo/10 text-celestial-indigo"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                )}

                {/* Linked Goal */}
                {post.linkedGoal && (
                  <div className="flex items-center gap-1.5 mt-2 ml-10">
                    <Target className="w-3 h-3 text-neural-mint" />
                    <span className="text-[8px] font-bold text-neural-mint">{post.linkedGoal}</span>
                  </div>
                )}

                {/* Reactions + Comment toggle */}
                <div className="flex items-center gap-2 mt-2.5 ml-10">
                  {/* Existing reactions */}
                  {post.reactions.map((reaction) => (
                    <button
                      key={reaction.emoji}
                      onClick={() => toggleReaction(post.id, reaction.emoji)}
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] transition-colors ${
                        reaction.hasReacted
                          ? 'bg-celestial-indigo/10 border border-celestial-indigo/20'
                          : 'bg-cloud/50 dark:bg-nebula-purple/10 border border-transparent hover:border-cloud dark:hover:border-nebula-purple/20'
                      }`}
                    >
                      <span>{reaction.emoji}</span>
                      <span
                        className={`font-bold ${reaction.hasReacted ? 'text-celestial-indigo' : 'text-silver-mist'}`}
                      >
                        {reaction.count}
                      </span>
                    </button>
                  ))}

                  {/* Add reaction */}
                  <div className="flex items-center gap-0.5">
                    {REACTION_EMOJIS.filter((e) => !post.reactions.some((r) => r.emoji === e))
                      .slice(0, 2)
                      .map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(post.id, emoji)}
                          className="w-5 h-5 rounded-full bg-cloud/30 dark:bg-nebula-purple/10 flex items-center justify-center text-[8px] hover:bg-cloud dark:hover:bg-nebula-purple/20 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                  </div>

                  <div className="flex-1" />

                  {/* Comments toggle */}
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1 text-[8px] text-silver-mist hover:text-celestial-indigo transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {post.comments.length > 0 && (
                      <span className="font-bold">{post.comments.length}</span>
                    )}
                    {showComments ? (
                      <ChevronUp className="w-2.5 h-2.5" />
                    ) : (
                      <ChevronDown className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments && (
                <div className="px-3 pb-3 pt-0 ml-10 space-y-2 border-t border-cloud/30 dark:border-nebula-purple/10 mt-1 pt-2">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-cloud dark:bg-nebula-purple/10 flex items-center justify-center text-[6px] font-bold text-silver-mist shrink-0 mt-0.5">
                        {getInitials(comment.authorName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-bold text-ink-black dark:text-pearl">
                            {comment.authorName}
                          </span>
                          <span className="text-[7px] text-silver-mist">
                            {timeAgo(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-[8px] text-ink-black dark:text-pearl mt-0.5">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Add comment */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                      placeholder="Add a comment..."
                      className="flex-1 px-2 py-1 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue text-[8px] text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                      className="p-1 rounded-lg bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-6 text-center">
          <Megaphone className="w-8 h-8 mx-auto text-silver-mist/30 mb-2" />
          <p className="text-[10px] text-silver-mist">No praises match the selected filter</p>
        </div>
      )}
    </div>
  );
};

export default PraiseWall;
