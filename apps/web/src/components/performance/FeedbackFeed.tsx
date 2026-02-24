/**
 * @module FeedbackFeed
 * @description Activity feed for continuous feedback — timeline cards with
 *              reactions, comments, category badges, and expand/collapse
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Heart,
  MessageCircle,
  Lightbulb,
  Globe,
  Lock,
  EyeOff,
  Send,
  ChevronDown,
  ChevronUp,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
} from 'lucide-react';
import type { FeedbackItem } from '@/services/feedbackService';

// ── Types ────────────────────────────────────────────────────────────────────────

interface FeedbackFeedProps {
  items: FeedbackItem[];
  onReaction: (feedbackId: string, type: string) => void;
  onComment: (feedbackId: string, body: string) => void;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  praise: { label: 'Praise', icon: Heart, color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
  constructive: {
    label: 'Constructive',
    icon: MessageCircle,
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10',
  },
  suggestion: {
    label: 'Suggestion',
    icon: Lightbulb,
    color: 'text-nebula-purple',
    bg: 'bg-nebula-purple/10',
  },
};

const VISIBILITY_ICON: Record<string, { icon: LucideIcon; label: string }> = {
  public: { icon: Globe, label: 'Public' },
  private: { icon: Lock, label: 'Private' },
  anonymous: { icon: EyeOff, label: 'Anonymous' },
};

const REACTION_OPTIONS = ['👏', '❤️', '💡', '🙏', '🔥'] as const;

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

// ── Component ────────────────────────────────────────────────────────────────────

export const FeedbackFeed: React.FC<FeedbackFeedProps> = ({ items, onReaction, onComment }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showReactions, setShowReactions] = useState<string | null>(null);

  const handleSendComment = useCallback(
    (feedbackId: string) => {
      const text = commentText[feedbackId]?.trim();
      if (!text) return;
      onComment(feedbackId, text);
      setCommentText((prev) => ({ ...prev, [feedbackId]: '' }));
    },
    [commentText, onComment]
  );

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-8 text-center">
        <MessageSquare className="w-10 h-10 mx-auto text-silver-mist/30 mb-2" />
        <p className="text-[11px] font-semibold text-silver-mist">No feedback yet</p>
        <p className="text-[9px] text-silver-mist/70 mt-0.5">Be the first to share feedback!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const catConfig = CATEGORY_CONFIG[item.category];
        const visConfig = VISIBILITY_ICON[item.visibility];
        const CatIcon = catConfig.icon;
        const VisIcon = visConfig.icon;
        const isExpanded = expandedId === item.id;
        const isGiven = item.fromId === 'emp-100';
        const isAnonymous = item.visibility === 'anonymous';

        return (
          <div
            key={item.id}
            className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden"
          >
            {/* Card Header */}
            <div className="px-3 py-2.5">
              <div className="flex items-start gap-2.5">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[9px] font-bold text-celestial-indigo shrink-0">
                  {isAnonymous && !isGiven ? (
                    <EyeOff className="w-3.5 h-3.5 text-silver-mist" />
                  ) : (
                    getInitials(isGiven ? item.toName : item.fromName)
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Meta Line */}
                  <div className="flex items-center flex-wrap gap-1 text-[8px]">
                    {isGiven ? (
                      <>
                        <span className="font-bold text-ink-black dark:text-pearl">You</span>
                        <ArrowUpRight className="w-2.5 h-2.5 text-silver-mist" />
                        <span className="font-semibold text-ink-black dark:text-pearl">
                          {item.toName}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-ink-black dark:text-pearl">
                          {isAnonymous ? 'Anonymous' : item.fromName}
                        </span>
                        <ArrowDownLeft className="w-2.5 h-2.5 text-silver-mist" />
                        <span className="font-semibold text-ink-black dark:text-pearl">You</span>
                      </>
                    )}
                    <span
                      className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded ${catConfig.bg} ${catConfig.color} text-[7px] font-bold`}
                    >
                      <CatIcon className="w-2 h-2" />
                      {catConfig.label}
                    </span>
                    <span className="flex items-center gap-0.5 text-silver-mist">
                      <VisIcon className="w-2.5 h-2.5" />
                      {visConfig.label}
                    </span>
                    <span className="text-silver-mist">·</span>
                    <span className="text-silver-mist">{formatTime(item.createdAt)}</span>
                  </div>

                  {/* Role info */}
                  {!isAnonymous && !isGiven && item.fromRole && (
                    <p className="text-[7px] text-silver-mist mt-0.5">
                      {item.fromRole} · {item.fromDepartment}
                    </p>
                  )}

                  {/* Message */}
                  <p className="text-[10px] text-ink-black dark:text-pearl mt-1.5 leading-relaxed whitespace-pre-wrap">
                    {item.message}
                  </p>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded-full text-[7px] font-semibold bg-cloud/50 dark:bg-nebula-purple/10 text-silver-mist"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Linked Goal */}
                  {item.linkedGoalTitle && (
                    <div className="flex items-center gap-1 mt-1.5 px-2 py-1 rounded-md bg-celestial-indigo/5 border border-celestial-indigo/10 w-fit">
                      <Target className="w-2.5 h-2.5 text-celestial-indigo" />
                      <span className="text-[7px] font-semibold text-celestial-indigo">
                        {item.linkedGoalTitle}
                      </span>
                    </div>
                  )}

                  {/* Reactions Bar */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {item.reactions.map((r) => (
                      <button
                        key={r.type}
                        onClick={() => onReaction(item.id, r.type)}
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
                        onClick={() => setShowReactions(showReactions === item.id ? null : item.id)}
                        className="px-1.5 py-0.5 rounded-full text-[9px] border border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
                      >
                        +
                      </button>
                      {showReactions === item.id && (
                        <div className="absolute bottom-full left-0 mb-1 flex gap-0.5 px-1.5 py-1 rounded-lg bg-white dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/20 shadow-lg z-10">
                          {REACTION_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                onReaction(item.id, emoji);
                                setShowReactions(null);
                              }}
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
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="flex items-center gap-0.5 text-[8px] font-semibold text-silver-mist hover:text-celestial-indigo transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      {item.comments.length > 0 && item.comments.length}
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

            {/* Comments Section */}
            {isExpanded && (
              <div className="border-t border-cloud dark:border-nebula-purple/10 bg-cloud/20 dark:bg-nebula-purple/5 px-3 py-2 space-y-2">
                {item.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[7px] font-bold text-celestial-indigo shrink-0">
                      {getInitials(comment.authorName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[8px]">
                        <span className="font-bold text-ink-black dark:text-pearl">
                          {comment.authorName}
                        </span>
                        <span className="text-silver-mist">· {comment.authorRole}</span>
                        <span className="text-silver-mist">· {formatTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-[9px] text-ink-black dark:text-pearl mt-0.5">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Comment Input */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={commentText[item.id] || ''}
                    onChange={(e) =>
                      setCommentText((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    placeholder="Add a comment..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendComment(item.id);
                    }}
                    className="flex-1 px-2.5 py-1.5 text-[9px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
                  />
                  <button
                    onClick={() => handleSendComment(item.id)}
                    disabled={!commentText[item.id]?.trim()}
                    className="p-1.5 rounded-lg bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
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
  );
};

export default FeedbackFeed;
