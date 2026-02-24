/**
 * @module FeedbackFilters
 * @description Filter bar for continuous feedback — category, visibility,
 *              direction, date range, and text search
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  Filter,
  Heart,
  Lightbulb,
  MessageCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import type { FeedbackFilters as FeedbackFiltersType } from '@/services/feedbackService';

// ── Types ────────────────────────────────────────────────────────────────────────

interface FeedbackFiltersProps {
  filters: FeedbackFiltersType;
  onChange: (update: Partial<FeedbackFiltersType>) => void;
  counts?: {
    all: number;
    praise: number;
    constructive: number;
    suggestion: number;
  };
}

// ── Config ───────────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: {
  key: 'all' | 'praise' | 'constructive' | 'suggestion';
  label: string;
  icon: LucideIcon;
  color: string;
}[] = [
  { key: 'all', label: 'All', icon: Filter, color: 'text-celestial-indigo' },
  { key: 'praise', label: 'Praise', icon: Heart, color: 'text-neural-mint' },
  { key: 'constructive', label: 'Constructive', icon: MessageCircle, color: 'text-sunset-amber' },
  { key: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-nebula-purple' },
];

const DIRECTION_OPTIONS: { key: 'all' | 'received' | 'given'; label: string; icon: LucideIcon }[] =
  [
    { key: 'all', label: 'All', icon: Filter },
    { key: 'received', label: 'Received', icon: ArrowDownLeft },
    { key: 'given', label: 'Given', icon: ArrowUpRight },
  ];

const DATE_OPTIONS: { key: 'all' | 'week' | 'month' | 'quarter' | 'year'; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'quarter', label: 'This quarter' },
  { key: 'year', label: 'This year' },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const FeedbackFilters: React.FC<FeedbackFiltersProps> = ({ filters, onChange, counts }) => {
  return (
    <div className="space-y-2.5">
      {/* Category Tabs */}
      <div className="flex rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {CATEGORY_OPTIONS.map((opt) => {
          const isActive = (filters.category || 'all') === opt.key;
          const OptIcon = opt.icon;
          return (
            <button
              key={opt.key}
              onClick={() => onChange({ category: opt.key })}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-bold transition-colors ${
                isActive
                  ? `${opt.color} bg-current/5 border-b-2`
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
              style={isActive ? { borderBottomColor: 'currentColor' } : undefined}
            >
              <OptIcon className="w-3 h-3" />
              {opt.label}
              {counts && (
                <span
                  className={`ml-0.5 px-1 py-0 rounded-full text-[7px] ${
                    isActive ? 'bg-current/10' : 'bg-cloud dark:bg-nebula-purple/10'
                  }`}
                >
                  {opt.key === 'all' ? counts.all : counts[opt.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Second Row: Search + Direction + Date */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver-mist" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search feedback..."
            className="w-full pl-8 pr-3 py-1.5 text-[10px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
          />
        </div>

        {/* Direction */}
        <div className="flex rounded-lg border border-cloud dark:border-nebula-purple/20 overflow-hidden">
          {DIRECTION_OPTIONS.map((opt) => {
            const isActive = (filters.direction || 'all') === opt.key;
            const DirIcon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => onChange({ direction: opt.key })}
                className={`flex items-center gap-0.5 px-2 py-1 text-[8px] font-bold transition-colors ${
                  isActive
                    ? 'bg-celestial-indigo/10 text-celestial-indigo'
                    : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
              >
                <DirIcon className="w-3 h-3" />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-silver-mist" />
          <select
            value={filters.dateRange || 'all'}
            onChange={(e) =>
              onChange({ dateRange: e.target.value as FeedbackFiltersType['dateRange'] })
            }
            className="text-[9px] font-semibold bg-transparent text-ink-black dark:text-pearl border-none outline-none cursor-pointer"
          >
            {DATE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FeedbackFilters;
