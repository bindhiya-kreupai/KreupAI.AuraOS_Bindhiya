/**
 * @module RecognitionWall
 * @description Public recognition feed with kudos cards, reactions, comments,
 *              core value badges, points display, and filtering
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  MessageCircle,
  Send,
  Star,
  Trophy,
  Zap,
  Users,
  Lightbulb,
  Shield,
  Target,
  ChevronDown,
  ChevronUp,
  EyeOff,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export type CoreValueKey =
  | 'innovation'
  | 'teamwork'
  | 'excellence'
  | 'integrity'
  | 'customer_focus';

export interface CoreValue {
  key: CoreValueKey;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export interface WallReaction {
  type: '👏' | '❤️' | '🔥' | '⭐' | '🎉';
  count: number;
  hasReacted: boolean;
}

export interface WallComment {
  id: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
}

export interface WallPost {
  id: string;
  senderName: string;
  senderRole: string;
  senderDepartment: string;
  recipientName: string;
  recipientRole: string;
  recipientDepartment: string;
  message: string;
  coreValues: CoreValueKey[];
  pointsAwarded: number;
  badgeName?: string;
  isAnonymous: boolean;
  reactions: WallReaction[];
  comments: WallComment[];
  createdAt: string;
}

interface RecognitionWallProps {
  posts: WallPost[];
}

// ── Config ───────────────────────────────────────────────────────────────────────

export const CORE_VALUES: CoreValue[] = [
  {
    key: 'innovation',
    label: 'Innovation',
    icon: Lightbulb,
    color: 'text-nebula-purple',
    bg: 'bg-nebula-purple/10',
  },
  {
    key: 'teamwork',
    label: 'Teamwork',
    icon: Users,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  {
    key: 'excellence',
    label: 'Excellence',
    icon: Star,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
  },
  {
    key: 'integrity',
    label: 'Integrity',
    icon: Shield,
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
  },
  {
    key: 'customer_focus',
    label: 'Customer Focus',
    icon: Target,
    color: 'text-quantum-rose',
    bg: 'bg-quantum-rose/10',
  },
];

const REACTION_OPTIONS = ['👏', '❤️', '🔥', '⭐', '🎉'] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_WALL_POSTS: WallPost[] = [
  {
    id: 'wp-1',
    senderName: 'Sarah Connor',
    senderRole: 'Head of Product',
    senderDepartment: 'Product',
    recipientName: 'Kyle Reese',
    recipientRole: 'Senior Engineer',
    recipientDepartment: 'Engineering',
    message:
      'Big shoutout to Kyle for his incredible work on the new deployment pipeline. You saved us hours of debugging and the team is so grateful! 🚀',
    coreValues: ['innovation', 'excellence'],
    pointsAwarded: 500,
    badgeName: 'Innovation Champion',
    isAnonymous: false,
    reactions: [
      { type: '👏', count: 24, hasReacted: true },
      { type: '🔥', count: 12, hasReacted: false },
      { type: '❤️', count: 8, hasReacted: false },
    ],
    comments: [
      {
        id: 'wc-1',
        authorName: 'Marcus Johnson',
        authorRole: 'Tech Lead',
        body: 'Well deserved! That pipeline is incredible.',
        createdAt: '2026-02-24T09:00:00Z',
      },
      {
        id: 'wc-2',
        authorName: 'Lisa Park',
        authorRole: 'DevOps Lead',
        body: 'Agree 100%! Deployment time dropped by 40%.',
        createdAt: '2026-02-24T09:30:00Z',
      },
    ],
    createdAt: '2026-02-24T08:30:00Z',
  },
  {
    id: 'wp-2',
    senderName: 'Michael Torres',
    senderRole: 'Engineering Manager',
    senderDepartment: 'Engineering',
    recipientName: 'Anika Shah',
    recipientRole: 'Product Designer',
    recipientDepartment: 'Design',
    message:
      'Anika redesigned the onboarding flow and user completion rates jumped from 62% to 91%! Her user research was thorough and the design is beautiful.',
    coreValues: ['customer_focus', 'excellence'],
    pointsAwarded: 750,
    badgeName: 'Customer Hero',
    isAnonymous: false,
    reactions: [
      { type: '❤️', count: 31, hasReacted: false },
      { type: '⭐', count: 15, hasReacted: true },
      { type: '🎉', count: 9, hasReacted: false },
    ],
    comments: [
      {
        id: 'wc-3',
        authorName: 'Carlos Rivera',
        authorRole: 'PM',
        body: 'The numbers speak for themselves. Amazing work!',
        createdAt: '2026-02-23T15:00:00Z',
      },
    ],
    createdAt: '2026-02-23T14:00:00Z',
  },
  {
    id: 'wp-3',
    senderName: 'Anonymous',
    senderRole: '',
    senderDepartment: '',
    recipientName: 'Jordan Lee',
    recipientRole: 'QA Engineer',
    recipientDepartment: 'Engineering',
    message:
      'Jordan always goes above and beyond to help the team. Whether it is staying late to run test suites or writing documentation nobody asked for — you make everyone better.',
    coreValues: ['teamwork', 'integrity'],
    pointsAwarded: 300,
    isAnonymous: true,
    reactions: [
      { type: '❤️', count: 18, hasReacted: false },
      { type: '👏', count: 14, hasReacted: false },
      { type: '🔥', count: 6, hasReacted: true },
    ],
    comments: [],
    createdAt: '2026-02-23T10:00:00Z',
  },
  {
    id: 'wp-4',
    senderName: 'Elena Rodriguez',
    senderRole: 'VP of Sales',
    senderDepartment: 'Sales',
    recipientName: 'David Kim',
    recipientRole: 'Solutions Architect',
    recipientDepartment: 'Engineering',
    message:
      'David joined the customer demo with 2 hours notice and delivered an absolutely flawless technical presentation. We closed a $500K deal partly because of his expertise!',
    coreValues: ['customer_focus', 'teamwork'],
    pointsAwarded: 1000,
    badgeName: 'Team Player',
    isAnonymous: false,
    reactions: [
      { type: '🎉', count: 42, hasReacted: false },
      { type: '🔥', count: 28, hasReacted: false },
      { type: '👏', count: 19, hasReacted: true },
    ],
    comments: [
      {
        id: 'wc-4',
        authorName: 'Rachel Green',
        authorRole: 'Account Exec',
        body: 'David saved the day. The client was blown away!',
        createdAt: '2026-02-22T17:00:00Z',
      },
      {
        id: 'wc-5',
        authorName: 'David Kim',
        authorRole: 'Solutions Architect',
        body: 'Thanks everyone! It was a team effort — Elena prepped me perfectly.',
        createdAt: '2026-02-22T18:00:00Z',
      },
    ],
    createdAt: '2026-02-22T16:00:00Z',
  },
  {
    id: 'wp-5',
    senderName: 'Priya Patel',
    senderRole: 'UX Researcher',
    senderDepartment: 'Design',
    recipientName: 'Engineering Team',
    recipientRole: 'Platform Team',
    recipientDepartment: 'Engineering',
    message:
      'Huge kudos to the Platform Team for shipping the accessibility overhaul. Our WCAG compliance score went from 67% to 98%. This impacts real lives!',
    coreValues: ['excellence', 'integrity', 'innovation'],
    pointsAwarded: 200,
    isAnonymous: false,
    reactions: [
      { type: '❤️', count: 56, hasReacted: true },
      { type: '👏', count: 38, hasReacted: false },
    ],
    comments: [],
    createdAt: '2026-02-21T11:00:00Z',
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const RecognitionWall: React.FC<RecognitionWallProps> = ({ posts: initialPosts }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [valueFilter, setValueFilter] = useState<CoreValueKey | 'all'>('all');

  const filtered =
    valueFilter === 'all' ? posts : posts.filter((p) => p.coreValues.includes(valueFilter));

  const handleReaction = useCallback((postId: string, type: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const existing = p.reactions.find((r) => r.type === type);
        if (existing) {
          return {
            ...p,
            reactions: p.reactions.map((r) =>
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
          ...p,
          reactions: [
            ...p.reactions,
            { type: type as WallReaction['type'], count: 1, hasReacted: true },
          ],
        };
      })
    );
    setShowReactionPicker(null);
  }, []);

  const handleComment = useCallback(
    (postId: string) => {
      const text = commentText[postId]?.trim();
      if (!text) return;
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: `wc-new-${Date.now()}`,
                    authorName: 'You',
                    authorRole: 'Senior Engineer',
                    body: text,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : p
        )
      );
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
    },
    [commentText]
  );

  return (
    <div className="space-y-3">
      {/* Core Value Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setValueFilter('all')}
          className={`px-2 py-1 rounded-lg text-[8px] font-bold transition-colors ${
            valueFilter === 'all'
              ? 'bg-celestial-indigo text-white'
              : 'text-silver-mist hover:bg-cloud/50 dark:hover:bg-nebula-purple/10'
          }`}
        >
          All
        </button>
        {CORE_VALUES.map((cv) => {
          const CvIcon = cv.icon;
          return (
            <button
              key={cv.key}
              onClick={() => setValueFilter(cv.key)}
              className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[8px] font-bold transition-colors ${
                valueFilter === cv.key
                  ? `${cv.bg} ${cv.color}`
                  : 'text-silver-mist hover:bg-cloud/50 dark:hover:bg-nebula-purple/10'
              }`}
            >
              <CvIcon className="w-3 h-3" />
              {cv.label}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-8 text-center">
          <Award className="w-10 h-10 mx-auto text-silver-mist/30 mb-2" />
          <p className="text-[11px] font-semibold text-silver-mist">No recognitions yet</p>
        </div>
      ) : (
        filtered.map((post) => {
          const isExpanded = expandedId === post.id;
          return (
            <div
              key={post.id}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden"
            >
              {/* Post Header */}
              <div className="px-4 py-3">
                <div className="flex items-start gap-3">
                  {/* Sender Avatar */}
                  <div className="w-9 h-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[10px] font-bold text-celestial-indigo shrink-0">
                    {post.isAnonymous ? (
                      <EyeOff className="w-4 h-4 text-silver-mist" />
                    ) : (
                      getInitials(post.senderName)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Sender → Recipient */}
                    <div className="flex items-center flex-wrap gap-1 text-[9px]">
                      <span className="font-bold text-ink-black dark:text-pearl">
                        {post.isAnonymous ? 'Someone' : post.senderName}
                      </span>
                      {!post.isAnonymous && (
                        <span className="text-silver-mist">· {post.senderRole}</span>
                      )}
                      <span className="text-silver-mist">recognized</span>
                      <span className="font-bold text-celestial-indigo">{post.recipientName}</span>
                      <span className="text-silver-mist">· {formatTime(post.createdAt)}</span>
                    </div>

                    {/* Core Values + Points */}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {post.coreValues.map((cvKey) => {
                        const cv = CORE_VALUES.find((v) => v.key === cvKey);
                        if (!cv) return null;
                        const CvIcon = cv.icon;
                        return (
                          <span
                            key={cvKey}
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold ${cv.bg} ${cv.color}`}
                          >
                            <CvIcon className="w-2.5 h-2.5" />
                            {cv.label}
                          </span>
                        );
                      })}
                      {post.pointsAwarded > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-sunset-amber/10 text-sunset-amber">
                          <Zap className="w-2.5 h-2.5" />+{post.pointsAwarded} pts
                        </span>
                      )}
                      {post.badgeName && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-quantum-rose/10 text-quantum-rose">
                          <Trophy className="w-2.5 h-2.5" />
                          {post.badgeName}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-[10px] text-ink-black dark:text-pearl mt-2 leading-relaxed">
                      {post.message}
                    </p>

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      {post.reactions.map((r) => (
                        <button
                          key={r.type}
                          onClick={() => handleReaction(post.id, r.type)}
                          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] border transition-colors ${
                            r.hasReacted
                              ? 'border-celestial-indigo/30 bg-celestial-indigo/5'
                              : 'border-cloud dark:border-nebula-purple/20 hover:bg-cloud/30 dark:hover:bg-nebula-purple/5'
                          }`}
                        >
                          <span>{r.type}</span>
                          <span
                            className={`text-[8px] font-bold ${r.hasReacted ? 'text-celestial-indigo' : 'text-silver-mist'}`}
                          >
                            {r.count}
                          </span>
                        </button>
                      ))}

                      {/* Add Reaction */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowReactionPicker(showReactionPicker === post.id ? null : post.id)
                          }
                          className="px-1.5 py-0.5 rounded-full text-[9px] border border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
                        >
                          +
                        </button>
                        {showReactionPicker === post.id && (
                          <div className="absolute bottom-full left-0 mb-1 flex gap-0.5 px-1.5 py-1 rounded-lg bg-white dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/20 shadow-lg z-10">
                            {REACTION_OPTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(post.id, emoji)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-cloud/50 dark:hover:bg-nebula-purple/10 transition-colors text-sm"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-1" />

                      {/* Comment Toggle */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : post.id)}
                        className="flex items-center gap-0.5 text-[8px] font-semibold text-silver-mist hover:text-celestial-indigo transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        {post.comments.length > 0 && <span>{post.comments.length}</span>}
                        {isExpanded ? (
                          <ChevronUp className="w-2.5 h-2.5" />
                        ) : (
                          <ChevronDown className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {isExpanded && (
                <div className="border-t border-cloud dark:border-nebula-purple/10 bg-cloud/20 dark:bg-nebula-purple/5 px-4 py-2.5 space-y-2">
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[7px] font-bold text-celestial-indigo shrink-0">
                        {getInitials(c.authorName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-[8px]">
                          <span className="font-bold text-ink-black dark:text-pearl">
                            {c.authorName}
                          </span>
                          <span className="text-silver-mist">
                            · {c.authorRole} · {formatTime(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-[9px] text-ink-black dark:text-pearl mt-0.5">{c.body}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={commentText[post.id] || ''}
                      onChange={(e) =>
                        setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      placeholder="Add a comment..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleComment(post.id);
                      }}
                      className="flex-1 px-2.5 py-1.5 text-[9px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      disabled={!commentText[post.id]?.trim()}
                      className="p-1.5 rounded-lg bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default RecognitionWall;
