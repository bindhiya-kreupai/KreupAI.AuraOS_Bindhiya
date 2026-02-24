/**
 * @module BenchmarkComparison
 * @description Market benchmark comparison for compensation planning
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Search,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface BenchmarkData {
  id: string;
  jobTitle: string;
  jobFamily: string;
  grade: string;
  geography: string;
  industry: string;
  source: string;
  surveyDate: string;
  currency: string;
  // Market percentiles
  p25: number;
  p50: number; // median
  p75: number;
  p90: number;
  // Internal data
  internalAvg: number;
  internalMin: number;
  internalMax: number;
  employeeCount: number;
  // Analysis
  marketRatio: number;
  competitivePosition: 'leading' | 'competitive' | 'lagging';
  gap: number;
  recommendation: string;
}

interface BenchmarkComparisonProps {
  benchmarks: BenchmarkData[];
}

const POSITION_CONFIG: Record<
  string,
  { icon: LucideIcon; label: string; color: string; bgColor: string }
> = {
  leading: {
    icon: TrendingUp,
    label: 'Above Market',
    color: 'text-neural-mint',
    bgColor: 'bg-neural-mint/10',
  },
  competitive: {
    icon: Minus,
    label: 'At Market',
    color: 'text-celestial-indigo',
    bgColor: 'bg-celestial-indigo/10',
  },
  lagging: {
    icon: TrendingDown,
    label: 'Below Market',
    color: 'text-coral-alert',
    bgColor: 'bg-coral-alert/10',
  },
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({ benchmarks }) => {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<
    'all' | 'leading' | 'competitive' | 'lagging'
  >('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = benchmarks;
    if (positionFilter !== 'all') {
      result = result.filter((b) => b.competitivePosition === positionFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.jobTitle.toLowerCase().includes(q) ||
          b.jobFamily.toLowerCase().includes(q) ||
          b.grade.toLowerCase().includes(q)
      );
    }
    return result;
  }, [benchmarks, positionFilter, search]);

  // Summary
  const positionCounts = useMemo(
    () => ({
      leading: benchmarks.filter((b) => b.competitivePosition === 'leading').length,
      competitive: benchmarks.filter((b) => b.competitivePosition === 'competitive').length,
      lagging: benchmarks.filter((b) => b.competitivePosition === 'lagging').length,
    }),
    [benchmarks]
  );

  const avgMarketRatio = useMemo(() => {
    if (benchmarks.length === 0) return 0;
    return (
      Math.round((benchmarks.reduce((s, b) => s + b.marketRatio, 0) / benchmarks.length) * 100) /
      100
    );
  }, [benchmarks]);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart3 className="w-3 h-3 text-celestial-indigo" />
            <span className="text-[9px] text-silver-mist">Avg Market Ratio</span>
          </div>
          <p
            className={`text-lg font-bold ${
              avgMarketRatio >= 1.05
                ? 'text-neural-mint'
                : avgMarketRatio >= 0.95
                  ? 'text-celestial-indigo'
                  : 'text-coral-alert'
            }`}
          >
            {avgMarketRatio.toFixed(2)}
          </p>
        </div>
        <div className="px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3 h-3 text-neural-mint" />
            <span className="text-[9px] text-silver-mist">Above Market</span>
          </div>
          <p className="text-lg font-bold text-neural-mint">{positionCounts.leading}</p>
        </div>
        <div className="px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3 h-3 text-celestial-indigo" />
            <span className="text-[9px] text-silver-mist">At Market</span>
          </div>
          <p className="text-lg font-bold text-celestial-indigo">{positionCounts.competitive}</p>
        </div>
        <div className="px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3 h-3 text-coral-alert" />
            <span className="text-[9px] text-silver-mist">Below Market</span>
          </div>
          <p className="text-lg font-bold text-coral-alert">{positionCounts.lagging}</p>
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, family, or grade..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'leading', 'competitive', 'lagging'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`text-[10px] px-2 py-1 rounded-lg border transition-colors capitalize ${
                positionFilter === pos
                  ? 'border-celestial-indigo bg-celestial-indigo/10 text-celestial-indigo font-semibold'
                  : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
              }`}
            >
              {pos === 'all' ? 'All' : POSITION_CONFIG[pos].label}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark rows */}
      <div className="space-y-2">
        {filtered.map((benchmark) => {
          const config = POSITION_CONFIG[benchmark.competitivePosition];
          const PosIcon = config.icon;
          const isExpanded = expandedId === benchmark.id;

          // Calculate bar positions (relative to p90 max)
          const maxVal = Math.max(benchmark.p90, benchmark.internalMax) * 1.1;
          const p25Pct = (benchmark.p25 / maxVal) * 100;
          const p50Pct = (benchmark.p50 / maxVal) * 100;
          const p75Pct = (benchmark.p75 / maxVal) * 100;
          const internalPct = (benchmark.internalAvg / maxVal) * 100;

          return (
            <div
              key={benchmark.id}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden"
            >
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : benchmark.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-ink-black dark:text-pearl truncate">
                      {benchmark.jobTitle}
                    </h4>
                    <span className="text-[9px] text-silver-mist">{benchmark.grade}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-silver-mist">
                    <span>{benchmark.jobFamily}</span>
                    <span>·</span>
                    <span>{benchmark.geography}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" /> {benchmark.employeeCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-ink-black dark:text-pearl">
                      {benchmark.marketRatio.toFixed(2)}
                    </p>
                    <p className="text-[9px] text-silver-mist">ratio</p>
                  </div>
                  <div
                    className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full ${config.bgColor}`}
                  >
                    <PosIcon className={`w-3 h-3 ${config.color}`} />
                    <span className={`text-[9px] font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded comparison view */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-cloud/50 dark:border-nebula-purple/10 pt-3">
                  {/* Visual comparison bar */}
                  <div>
                    <p className="text-[10px] text-silver-mist mb-2">Market Percentile Range</p>
                    <div className="relative h-8 rounded-lg bg-pearl/50 dark:bg-deep-cosmos/20">
                      {/* P25-P75 range bar */}
                      <div
                        className="absolute inset-y-1 bg-celestial-indigo/15 rounded"
                        style={{ left: `${p25Pct}%`, width: `${p75Pct - p25Pct}%` }}
                      />
                      {/* P50 median line */}
                      <div
                        className="absolute inset-y-0 w-0.5 bg-celestial-indigo z-10"
                        style={{ left: `${p50Pct}%` }}
                      />
                      {/* Internal avg marker */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-stellar-blue z-20 ${
                          benchmark.competitivePosition === 'leading'
                            ? 'bg-neural-mint'
                            : benchmark.competitivePosition === 'competitive'
                              ? 'bg-celestial-indigo'
                              : 'bg-coral-alert'
                        }`}
                        style={{ left: `${internalPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[8px] text-silver-mist">
                      <span>P25: {formatCurrency(benchmark.p25, benchmark.currency)}</span>
                      <span className="font-semibold">
                        Median: {formatCurrency(benchmark.p50, benchmark.currency)}
                      </span>
                      <span>P75: {formatCurrency(benchmark.p75, benchmark.currency)}</span>
                    </div>
                  </div>

                  {/* Data table */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-silver-mist">Internal Average</span>
                      <span className="text-[10px] font-semibold text-ink-black dark:text-pearl">
                        {formatCurrency(benchmark.internalAvg, benchmark.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-silver-mist">Market Median</span>
                      <span className="text-[10px] font-semibold text-ink-black dark:text-pearl">
                        {formatCurrency(benchmark.p50, benchmark.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-silver-mist">Internal Range</span>
                      <span className="text-[10px] text-ink-black dark:text-pearl">
                        {formatCurrency(benchmark.internalMin, benchmark.currency)} –{' '}
                        {formatCurrency(benchmark.internalMax, benchmark.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-silver-mist">Market P90</span>
                      <span className="text-[10px] text-ink-black dark:text-pearl">
                        {formatCurrency(benchmark.p90, benchmark.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-silver-mist">Gap to Median</span>
                      <span
                        className={`text-[10px] font-semibold ${benchmark.gap >= 0 ? 'text-neural-mint' : 'text-coral-alert'}`}
                      >
                        {benchmark.gap >= 0 ? '+' : ''}
                        {formatCurrency(benchmark.gap, benchmark.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-silver-mist">Source</span>
                      <span className="text-[10px] text-ink-black dark:text-pearl flex items-center gap-0.5">
                        {benchmark.source} <ExternalLink className="w-2 h-2" />
                      </span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div
                    className={`px-3 py-2 rounded-lg ${config.bgColor} border ${
                      benchmark.competitivePosition === 'lagging'
                        ? 'border-coral-alert/20'
                        : benchmark.competitivePosition === 'leading'
                          ? 'border-neural-mint/20'
                          : 'border-celestial-indigo/20'
                    }`}
                  >
                    <p className={`text-[10px] font-semibold ${config.color} mb-0.5`}>
                      Recommendation
                    </p>
                    <p className="text-[10px] text-ink-black dark:text-pearl">
                      {benchmark.recommendation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="w-8 h-8 text-silver-mist/20 mx-auto mb-2" />
            <p className="text-xs text-silver-mist">No benchmarks match your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchmarkComparison;
