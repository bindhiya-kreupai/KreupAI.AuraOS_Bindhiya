/**
 * @module CompReviewHistory
 * @description Compensation review history timeline
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  TrendingUp,
  Calendar,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CompReviewRecord {
  id: string;
  cycleId: string;
  cycleName: string;
  fiscalYear: string;
  incrementType: 'merit' | 'promotion' | 'market_adjustment' | 'cost_of_living' | 'retention';
  effectiveDate: string;
  processedDate: string;
  status: 'processed' | 'approved' | 'pending' | 'rejected';

  // Budget info
  totalBudget: number;
  usedBudget: number;
  currency: string;

  // Employee info
  totalEligible: number;
  totalProcessed: number;
  avgIncrementPercent: number;
  minIncrementPercent: number;
  maxIncrementPercent: number;

  // Department breakdown
  departments: {
    name: string;
    headcount: number;
    avgIncrement: number;
    totalCost: number;
  }[];
}

interface CompReviewHistoryProps {
  reviews: CompReviewRecord[];
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  merit: { label: 'Merit', color: 'text-celestial-indigo', bgColor: 'bg-celestial-indigo/10' },
  promotion: { label: 'Promotion', color: 'text-neural-mint', bgColor: 'bg-neural-mint/10' },
  market_adjustment: {
    label: 'Market Adj.',
    color: 'text-nebula-purple',
    bgColor: 'bg-nebula-purple/10',
  },
  cost_of_living: { label: 'CoL', color: 'text-sunset-amber', bgColor: 'bg-sunset-amber/10' },
  retention: { label: 'Retention', color: 'text-quantum-rose', bgColor: 'bg-quantum-rose/10' },
};

const STATUS_CONFIG: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  processed: { icon: CheckCircle2, label: 'Processed', color: 'text-neural-mint' },
  approved: { icon: CheckCircle2, label: 'Approved', color: 'text-celestial-indigo' },
  pending: { icon: Clock, label: 'Pending', color: 'text-sunset-amber' },
  rejected: { icon: XCircle, label: 'Rejected', color: 'text-coral-alert' },
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CompReviewHistory: React.FC<CompReviewHistoryProps> = ({ reviews }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...reviews].sort(
      (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    );
    if (typeFilter !== 'all') {
      result = result.filter((r) => r.incrementType === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.cycleName.toLowerCase().includes(q) || r.fiscalYear.includes(q)
      );
    }
    return result;
  }, [reviews, typeFilter, search]);

  // Grouped by fiscal year
  const grouped = useMemo(() => {
    const groups: Record<string, CompReviewRecord[]> = {};
    filtered.forEach((r) => {
      if (!groups[r.fiscalYear]) groups[r.fiscalYear] = [];
      groups[r.fiscalYear].push(r);
    });
    return groups;
  }, [filtered]);

  // Trend data
  const avgIncrementTrend = useMemo(() => {
    return Object.entries(grouped)
      .map(([year, records]) => ({
        year,
        avg:
          Math.round(
            (records.reduce((s, r) => s + r.avgIncrementPercent, 0) / records.length) * 10
          ) / 10,
        totalCost: records.reduce((s, r) => s + r.usedBudget, 0),
      }))
      .reverse();
  }, [grouped]);

  return (
    <div className="space-y-4">
      {/* Trend summary */}
      {avgIncrementTrend.length > 1 && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-3">
          <h4 className="text-[10px] font-semibold text-silver-mist mb-2">Increment Trend</h4>
          <div className="flex items-end gap-3 h-16">
            {avgIncrementTrend.map((t) => {
              const maxAvg = Math.max(...avgIncrementTrend.map((x) => x.avg));
              const heightPct = maxAvg > 0 ? (t.avg / maxAvg) * 100 : 0;
              return (
                <div key={t.year} className="flex-1 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-celestial-indigo mb-0.5">
                    {t.avg}%
                  </span>
                  <div
                    className="w-full rounded-t-md bg-celestial-indigo/20 transition-all"
                    style={{ height: `${heightPct}%`, minHeight: '4px' }}
                  />
                  <span className="text-[8px] text-silver-mist mt-1">{t.year}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & filter */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cycles..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
              typeFilter === 'all'
                ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
            }`}
          >
            All
          </button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                typeFilter === key
                  ? `border-current ${cfg.color} ${cfg.bgColor} font-semibold`
                  : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-10">
          <History className="w-8 h-8 text-silver-mist/20 mx-auto mb-2" />
          <p className="text-xs text-silver-mist">No review history found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([year, records]) => (
            <div key={year}>
              <h4 className="text-[10px] font-bold text-silver-mist uppercase tracking-wider mb-2 px-1">
                FY {year}
              </h4>
              <div className="space-y-2 relative">
                <div className="absolute left-[18px] top-4 bottom-4 w-px bg-cloud dark:bg-nebula-purple/20" />

                {records.map((record) => {
                  const isExpanded = expandedId === record.id;
                  const typeConfig = TYPE_CONFIG[record.incrementType];
                  const statusConfig = STATUS_CONFIG[record.status];
                  const StatusIcon = statusConfig.icon;
                  const budgetUtil =
                    record.totalBudget > 0
                      ? Math.round((record.usedBudget / record.totalBudget) * 100)
                      : 0;

                  return (
                    <div key={record.id} className="relative pl-10">
                      <div
                        className={`absolute left-3 top-4 w-3 h-3 rounded-full border-2 ${
                          record.status === 'processed'
                            ? 'bg-neural-mint/20 border-neural-mint'
                            : record.status === 'approved'
                              ? 'bg-celestial-indigo/20 border-celestial-indigo'
                              : record.status === 'rejected'
                                ? 'bg-coral-alert/20 border-coral-alert'
                                : 'bg-sunset-amber/20 border-sunset-amber'
                        }`}
                      />

                      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
                        <div
                          className="flex items-center gap-3 p-3 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : record.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h5 className="text-xs font-semibold text-ink-black dark:text-pearl truncate">
                                {record.cycleName}
                              </h5>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${typeConfig.color} ${typeConfig.bgColor}`}
                              >
                                {typeConfig.label}
                              </span>
                              <span
                                className={`text-[9px] flex items-center gap-0.5 ${statusConfig.color}`}
                              >
                                <StatusIcon className="w-2.5 h-2.5" /> {statusConfig.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-silver-mist">
                              <span className="flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" />
                                {new Date(record.effectiveDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Users className="w-2.5 h-2.5" /> {record.totalProcessed}/
                                {record.totalEligible}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <TrendingUp className="w-2.5 h-2.5" /> Avg{' '}
                                {record.avgIncrementPercent}%
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-ink-black dark:text-pearl">
                              {formatCurrency(record.usedBudget, record.currency)}
                            </p>
                            <p className="text-[9px] text-silver-mist">{budgetUtil}% of budget</p>
                          </div>

                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-silver-mist shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-silver-mist shrink-0" />
                          )}
                        </div>

                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-3 border-t border-cloud/50 dark:border-nebula-purple/10 pt-3">
                            {/* Stats grid */}
                            <div className="grid grid-cols-4 gap-2">
                              <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
                                <p className="text-[8px] text-silver-mist">Total Budget</p>
                                <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                                  {formatCurrency(record.totalBudget, record.currency)}
                                </p>
                              </div>
                              <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
                                <p className="text-[8px] text-silver-mist">Min Increment</p>
                                <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                                  {record.minIncrementPercent}%
                                </p>
                              </div>
                              <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
                                <p className="text-[8px] text-silver-mist">Avg Increment</p>
                                <p className="text-[10px] font-bold text-celestial-indigo">
                                  {record.avgIncrementPercent}%
                                </p>
                              </div>
                              <div className="px-2 py-1.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/10 text-center">
                                <p className="text-[8px] text-silver-mist">Max Increment</p>
                                <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                                  {record.maxIncrementPercent}%
                                </p>
                              </div>
                            </div>

                            {/* Department breakdown */}
                            {record.departments.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-silver-mist mb-1.5">
                                  Department Breakdown
                                </p>
                                <div className="space-y-1">
                                  {record.departments.map((dept) => (
                                    <div
                                      key={dept.name}
                                      className="flex items-center gap-3 text-[10px]"
                                    >
                                      <span className="text-ink-black dark:text-pearl w-28 truncate">
                                        {dept.name}
                                      </span>
                                      <span className="text-silver-mist w-12">
                                        {dept.headcount} emp
                                      </span>
                                      <div className="flex-1 h-1.5 rounded-full bg-cloud dark:bg-nebula-purple/20 overflow-hidden">
                                        <div
                                          className="h-full rounded-full bg-celestial-indigo/50"
                                          style={{
                                            width: `${Math.min(dept.avgIncrement * 5, 100)}%`,
                                          }}
                                        />
                                      </div>
                                      <span className="text-celestial-indigo font-semibold w-10 text-right">
                                        {dept.avgIncrement}%
                                      </span>
                                      <span className="text-silver-mist w-20 text-right">
                                        {formatCurrency(dept.totalCost, record.currency)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompReviewHistory;
