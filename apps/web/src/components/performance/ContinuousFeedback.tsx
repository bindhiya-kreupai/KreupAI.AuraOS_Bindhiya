/**
 * @module ContinuousFeedback
 * @description Main feedback hub orchestrating stats, form, filters, and
 *              activity feed with praise/constructive/suggestion types
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  MessageSquare,
  TrendingUp,
  Heart,
  MessageCircle,
  Lightbulb,
  EyeOff,
  Zap,
  Tag,
  Plus,
} from 'lucide-react';
import { useFeedback } from '@/hooks/useFeedback';
import { FeedbackFilters } from './FeedbackFilters';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackFeed } from './FeedbackFeed';
import type { FeedbackFormData } from '@/services/feedbackService';

// ── Component ────────────────────────────────────────────────────────────────────

export const ContinuousFeedback: React.FC = () => {
  const {
    feedbackItems,
    allItems,
    stats,
    filters,
    isLoading,
    isSaving,
    createFeedback,
    toggleReaction,
    addComment,
    updateFilters,
  } = useFeedback();

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = useCallback(
    (data: FeedbackFormData) => {
      createFeedback(data);
      setShowForm(false);
    },
    [createFeedback]
  );

  // Counts for filter badges
  const counts = {
    all: allItems.length,
    praise: allItems.filter((i) => i.category === 'praise').length,
    constructive: allItems.filter((i) => i.category === 'constructive').length,
    suggestion: allItems.filter((i) => i.category === 'suggestion').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          {
            label: 'Received',
            value: stats.totalReceived,
            icon: TrendingUp,
            color: 'text-celestial-indigo',
            bg: 'bg-celestial-indigo/10',
          },
          {
            label: 'Given',
            value: stats.totalGiven,
            icon: MessageSquare,
            color: 'text-neural-mint',
            bg: 'bg-neural-mint/10',
          },
          {
            label: 'Praise',
            value: stats.praiseCount,
            icon: Heart,
            color: 'text-neural-mint',
            bg: 'bg-neural-mint/10',
          },
          {
            label: 'Constructive',
            value: stats.constructiveCount,
            icon: MessageCircle,
            color: 'text-sunset-amber',
            bg: 'bg-sunset-amber/10',
          },
          {
            label: 'Suggestions',
            value: stats.suggestionCount,
            icon: Lightbulb,
            color: 'text-nebula-purple',
            bg: 'bg-nebula-purple/10',
          },
          {
            label: 'Anonymous',
            value: stats.anonymousCount,
            icon: EyeOff,
            color: 'text-silver-mist',
            bg: 'bg-silver-mist/10',
          },
          {
            label: 'Streak',
            value: `${stats.streak}d`,
            icon: Zap,
            color: 'text-sunset-amber',
            bg: 'bg-sunset-amber/10',
          },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-2.5 text-center"
            >
              <div
                className={`w-7 h-7 mx-auto rounded-lg ${stat.bg} flex items-center justify-center mb-1`}
              >
                <StatIcon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <p className="text-[14px] font-black text-ink-black dark:text-pearl">{stat.value}</p>
              <p className="text-[7px] text-silver-mist font-semibold">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Top Tags */}
      {stats.topTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-3 h-3 text-silver-mist" />
          <span className="text-[8px] font-bold text-silver-mist">Top tags:</span>
          {stats.topTags.map((t) => (
            <span
              key={t.tag}
              className="px-1.5 py-0.5 rounded-full text-[7px] font-semibold bg-celestial-indigo/10 text-celestial-indigo"
            >
              {t.tag} ({t.count})
            </span>
          ))}
        </div>
      )}

      {/* Give Feedback Button / Form */}
      {showForm ? (
        <FeedbackForm
          onSubmit={handleSubmit}
          isSaving={isSaving}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-celestial-indigo/20 text-celestial-indigo hover:border-celestial-indigo/40 hover:bg-celestial-indigo/5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[11px] font-bold">Give Feedback</span>
        </button>
      )}

      {/* Filters */}
      <FeedbackFilters filters={filters} onChange={updateFilters} counts={counts} />

      {/* Feed */}
      {isLoading ? (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-8 text-center">
          <div className="w-6 h-6 border-2 border-celestial-indigo/30 border-t-celestial-indigo rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[10px] text-silver-mist">Loading feedback...</p>
        </div>
      ) : (
        <FeedbackFeed items={feedbackItems} onReaction={toggleReaction} onComment={addComment} />
      )}

      {/* Results Count */}
      {!isLoading && (
        <p className="text-[8px] text-silver-mist text-center">
          Showing {feedbackItems.length} of {allItems.length} feedback items
        </p>
      )}
    </div>
  );
};

export default ContinuousFeedback;
