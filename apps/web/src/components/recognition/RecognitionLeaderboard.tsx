/**
 * @module RecognitionLeaderboard
 * @description Recognition leaderboard with podium, rankings, trends,
 *              period filters, and points/recognition counts
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal,
  Award,
  Zap,
  Star,
  BarChart3,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

type LeaderboardType =
  | 'points_earned'
  | 'recognitions_received'
  | 'recognitions_given'
  | 'badges_earned';
type Period = 'month' | 'quarter' | 'year' | 'all_time';
type Trend = 'up' | 'down' | 'stable';

interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  employeeName: string;
  department: string;
  value: number;
  trend: Trend;
  previousRank?: number;
  isCurrentUser?: boolean;
}

interface RecognitionLeaderboardProps {
  entries: LeaderboardEntry[];
}

// ── Config ───────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: { key: LeaderboardType; label: string; icon: LucideIcon; suffix: string }[] = [
  { key: 'points_earned', label: 'Points', icon: Zap, suffix: 'pts' },
  { key: 'recognitions_received', label: 'Received', icon: Star, suffix: '' },
  { key: 'recognitions_given', label: 'Given', icon: Award, suffix: '' },
  { key: 'badges_earned', label: 'Badges', icon: Medal, suffix: '' },
];

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'This Quarter' },
  { key: 'year', label: 'This Year' },
  { key: 'all_time', label: 'All Time' },
];

const TREND_ICON: Record<Trend, { icon: LucideIcon; color: string }> = {
  up: { icon: TrendingUp, color: 'text-neural-mint' },
  down: { icon: TrendingDown, color: 'text-coral-alert' },
  stable: { icon: Minus, color: 'text-silver-mist' },
};

const PODIUM_CONFIG = [
  {
    rank: 2,
    height: 'h-20',
    bg: 'bg-gradient-to-t from-slate-300 to-slate-200',
    ring: 'ring-slate-300',
    label: '🥈',
  },
  {
    rank: 1,
    height: 'h-28',
    bg: 'bg-gradient-to-t from-yellow-400 to-amber-300',
    ring: 'ring-yellow-400',
    label: '🥇',
  },
  {
    rank: 3,
    height: 'h-16',
    bg: 'bg-gradient-to-t from-amber-600 to-amber-500',
    ring: 'ring-amber-500',
    label: '🥉',
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

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    employeeId: 'emp-208',
    employeeName: 'David Kim',
    department: 'Engineering',
    value: 4250,
    trend: 'up',
    previousRank: 2,
  },
  {
    rank: 2,
    employeeId: 'emp-203',
    employeeName: 'Anika Shah',
    department: 'Design',
    value: 3800,
    trend: 'up',
    previousRank: 4,
  },
  {
    rank: 3,
    employeeId: 'emp-206',
    employeeName: 'Carlos Rivera',
    department: 'Product',
    value: 3450,
    trend: 'down',
    previousRank: 1,
  },
  {
    rank: 4,
    employeeId: 'emp-100',
    employeeName: 'You',
    department: 'Engineering',
    value: 3100,
    trend: 'up',
    previousRank: 6,
    isCurrentUser: true,
  },
  {
    rank: 5,
    employeeId: 'emp-201',
    employeeName: 'Michael Torres',
    department: 'Engineering',
    value: 2900,
    trend: 'stable',
  },
  {
    rank: 6,
    employeeId: 'emp-202',
    employeeName: 'Lisa Park',
    department: 'Engineering',
    value: 2650,
    trend: 'down',
    previousRank: 3,
  },
  {
    rank: 7,
    employeeId: 'emp-209',
    employeeName: 'Elena Rodriguez',
    department: 'Sales',
    value: 2400,
    trend: 'up',
    previousRank: 9,
  },
  {
    rank: 8,
    employeeId: 'emp-204',
    employeeName: 'Jordan Lee',
    department: 'Engineering',
    value: 2150,
    trend: 'stable',
  },
  {
    rank: 9,
    employeeId: 'emp-210',
    employeeName: 'Priya Patel',
    department: 'Design',
    value: 1900,
    trend: 'up',
    previousRank: 12,
  },
  {
    rank: 10,
    employeeId: 'emp-205',
    employeeName: 'Rachel Green',
    department: 'Engineering',
    value: 1750,
    trend: 'down',
    previousRank: 7,
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const RecognitionLeaderboard: React.FC<RecognitionLeaderboardProps> = ({ entries }) => {
  const [activeType, setActiveType] = useState<LeaderboardType>('points_earned');
  const [activePeriod, setActivePeriod] = useState<Period>('month');

  const typeConfig = TYPE_CONFIG.find((t) => t.key === activeType)!;
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const currentUser = entries.find((e) => e.isCurrentUser);
  const maxValue = entries.length > 0 ? entries[0].value : 1;

  // Podium order: 2nd, 1st, 3rd
  const podiumEntries = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="space-y-3">
      {/* Type Tabs */}
      <div className="flex rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {TYPE_CONFIG.map((t) => {
          const isActive = activeType === t.key;
          const TIcon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-bold transition-colors ${
                isActive
                  ? 'text-celestial-indigo bg-celestial-indigo/5 border-b-2 border-celestial-indigo'
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              <TIcon className="w-3 h-3" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Period Filter */}
      <div className="flex items-center gap-1">
        {PERIOD_OPTIONS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePeriod(p.key)}
            className={`px-2 py-1 rounded-md text-[8px] font-bold transition-colors ${
              activePeriod === p.key
                ? 'bg-celestial-indigo/10 text-celestial-indigo'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Podium */}
      {top3.length >= 3 && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
          <div className="flex items-end justify-center gap-3">
            {PODIUM_CONFIG.map((podium, i) => {
              const entry = podiumEntries[i];
              if (!entry) return null;
              const isFirst = podium.rank === 1;
              return (
                <div key={podium.rank} className="flex flex-col items-center">
                  {/* Avatar */}
                  <div className={`relative mb-1.5 ${isFirst ? 'mb-2' : ''}`}>
                    {isFirst && (
                      <Crown className="w-5 h-5 text-yellow-500 absolute -top-5 left-1/2 -translate-x-1/2" />
                    )}
                    <div
                      className={`w-12 h-12 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[12px] font-bold text-celestial-indigo ring-2 ${podium.ring} ${entry.isCurrentUser ? 'ring-celestial-indigo' : ''}`}
                    >
                      {getInitials(entry.employeeName)}
                    </div>
                  </div>
                  <p
                    className={`text-[9px] font-bold text-center ${entry.isCurrentUser ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}
                  >
                    {entry.employeeName}
                  </p>
                  <p className="text-[7px] text-silver-mist">{entry.department}</p>
                  <p
                    className={`text-[11px] font-black mt-0.5 ${isFirst ? 'text-sunset-amber' : 'text-ink-black dark:text-pearl'}`}
                  >
                    {entry.value.toLocaleString()}
                    {typeConfig.suffix ? ` ${typeConfig.suffix}` : ''}
                  </p>

                  {/* Podium bar */}
                  <div
                    className={`w-20 ${podium.height} ${podium.bg} rounded-t-lg mt-1.5 flex items-center justify-center`}
                  >
                    <span className="text-2xl">{podium.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Your Position Highlight */}
      {currentUser && currentUser.rank > 3 && (
        <div className="rounded-xl border-2 border-celestial-indigo/20 bg-celestial-indigo/5 px-4 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[10px] font-bold text-celestial-indigo">
            #{currentUser.rank}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-celestial-indigo">Your Position</p>
            <p className="text-[8px] text-silver-mist">{currentUser.department}</p>
          </div>
          <p className="text-[14px] font-black text-celestial-indigo">
            {currentUser.value.toLocaleString()}
            {typeConfig.suffix ? ` ${typeConfig.suffix}` : ''}
          </p>
          {(() => {
            const T = TREND_ICON[currentUser.trend];
            const TrendIcon = T.icon;
            return (
              <div className="flex items-center gap-0.5">
                <TrendIcon className={`w-3.5 h-3.5 ${T.color}`} />
                {currentUser.previousRank && (
                  <span className={`text-[8px] font-bold ${T.color}`}>
                    {currentUser.trend === 'up'
                      ? `+${currentUser.previousRank - currentUser.rank}`
                      : currentUser.trend === 'down'
                        ? `${currentUser.previousRank - currentUser.rank}`
                        : '—'}
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Rankings List */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
        {rest.length === 0 && top3.length <= 3 ? (
          <div className="p-6 text-center">
            <BarChart3 className="w-8 h-8 mx-auto text-silver-mist/30 mb-2" />
            <p className="text-[10px] text-silver-mist">No additional rankings</p>
          </div>
        ) : (
          rest.map((entry) => {
            const trendCfg = TREND_ICON[entry.trend];
            const TrendIcon = trendCfg.icon;
            const barWidth = Math.round((entry.value / maxValue) * 100);
            return (
              <div
                key={entry.employeeId}
                className={`flex items-center gap-3 px-4 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 last:border-b-0 ${
                  entry.isCurrentUser ? 'bg-celestial-indigo/5' : ''
                }`}
              >
                {/* Rank */}
                <span
                  className={`w-6 text-center text-[11px] font-black ${entry.isCurrentUser ? 'text-celestial-indigo' : 'text-silver-mist'}`}
                >
                  {entry.rank}
                </span>

                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${
                    entry.isCurrentUser
                      ? 'bg-celestial-indigo/20 text-celestial-indigo'
                      : 'bg-cloud dark:bg-nebula-purple/10 text-silver-mist'
                  }`}
                >
                  {getInitials(entry.employeeName)}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[10px] font-bold truncate ${entry.isCurrentUser ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}
                  >
                    {entry.employeeName}
                  </p>
                  <p className="text-[7px] text-silver-mist">{entry.department}</p>
                </div>

                {/* Bar */}
                <div className="w-24 hidden sm:block">
                  <div className="h-1.5 w-full rounded-full bg-cloud dark:bg-nebula-purple/20">
                    <div
                      className={`h-full rounded-full ${entry.isCurrentUser ? 'bg-celestial-indigo' : 'bg-sunset-amber/60'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>

                {/* Value */}
                <span
                  className={`text-[11px] font-black w-16 text-right ${entry.isCurrentUser ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}
                >
                  {entry.value.toLocaleString()}
                </span>

                {/* Trend */}
                <div className="flex items-center gap-0.5 w-10">
                  <TrendIcon className={`w-3 h-3 ${trendCfg.color}`} />
                  {entry.previousRank && entry.trend !== 'stable' && (
                    <span className={`text-[7px] font-bold ${trendCfg.color}`}>
                      {Math.abs(entry.previousRank - entry.rank)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecognitionLeaderboard;
