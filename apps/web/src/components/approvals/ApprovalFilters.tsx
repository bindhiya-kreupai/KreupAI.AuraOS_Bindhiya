/**
 * @module ApprovalFilters
 * @description Filter controls for approval requests by type, date, priority, and search
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import {
  Search,
  Filter,
  Calendar,
  Receipt,
  Shuffle,
  ArrowRightLeft,
  Award,
  ArrowLeftRight,
  Palmtree,
  TimerReset,
  FileText,
  ClipboardCheck,
  Gift,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ApprovalType, Priority } from '@/services/approvalService';

export interface FilterState {
  search: string;
  type: ApprovalType | 'all';
  priority: Priority | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'overdue';
}

interface ApprovalFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  counts: Record<ApprovalType, number> & { total: number };
}

const TYPE_OPTIONS: { key: ApprovalType | 'all'; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: 'All', icon: Filter },
  { key: 'expense', label: 'Expense', icon: Receipt },
  { key: 'employment-history', label: 'Employment Change', icon: Shuffle },
  { key: 'inter-company-transfer', label: 'Company Transfer', icon: ArrowRightLeft },
  { key: 'leave', label: 'Leave', icon: Palmtree },
  { key: 'overtime', label: 'Overtime', icon: TimerReset },
  { key: 'comp-off', label: 'Comp-Off', icon: Gift },
  { key: 'confirmation', label: 'Confirmation', icon: Award },
  { key: 'shift-swap', label: 'Shift Swap', icon: ArrowLeftRight },
  { key: 'exit', label: 'Exit', icon: FileText },
  { key: 'attendance', label: 'Attendance', icon: ClipboardCheck },
];

const DATE_OPTIONS: { key: FilterState['dateRange']; label: string }[] = [
  { key: 'all', label: 'Any Date' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'overdue', label: 'Overdue' },
];

const PRIORITY_OPTIONS: { key: Priority | 'all'; label: string }[] = [
  { key: 'all', label: 'Any Priority' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

export const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({ filters, onChange, counts }) => {
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.priority !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.search.trim() !== '';

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-silver-mist absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Search approvals by name, title, department..."
          className="w-full pl-8 pr-3 py-2 rounded-xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
        />
      </div>

      {/* Type filter chips with counts */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TYPE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const count = opt.key === 'all' ? counts.total : counts[opt.key];
          return (
            <button
              key={opt.key}
              onClick={() => update('type', opt.key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
                filters.type === opt.key
                  ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                  : 'border-cloud dark:border-nebula-purple/30 text-silver-mist hover:border-celestial-indigo/40'
              }`}
            >
              <Icon className="w-3 h-3" />
              {opt.label}
              {count > 0 && (
                <span
                  className={`text-[9px] px-1 py-0.5 rounded-full font-bold ${
                    filters.type === opt.key
                      ? 'bg-celestial-indigo/20'
                      : 'bg-pearl dark:bg-deep-cosmos/30'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Date & priority row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-silver-mist" />
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => update('dateRange', opt.key)}
              className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                filters.dateRange === opt.key
                  ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                  : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-cloud dark:bg-nebula-purple/20" />

        <div className="flex items-center gap-1">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => update('priority', opt.key)}
              className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                filters.priority === opt.key
                  ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                  : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => onChange({ search: '', type: 'all', priority: 'all', dateRange: 'all' })}
            className="flex items-center gap-0.5 text-[10px] text-coral-alert hover:text-coral-alert/80 transition-colors ml-auto"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ApprovalFilters;
