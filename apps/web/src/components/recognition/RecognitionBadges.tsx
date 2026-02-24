/**
 * @module RecognitionBadges
 * @description Badge gallery showing earned/locked badges with levels,
 *              progress, rarity, and unlock criteria
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import { Lock, CheckCircle2, Trophy, Zap, Clock } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: BadgeLevel;
  rarity: BadgeRarity;
  category: string;
  criteria: string;
  pointsValue: number;
  isEarned: boolean;
  earnedDate?: string;
  earnedCount?: number;
  progress?: number;
  progressMax?: number;
  totalAwarded: number;
}

interface RecognitionBadgesProps {
  badges: BadgeData[];
  totalPoints: number;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<
  BadgeLevel,
  { label: string; gradient: string; border: string; text: string }
> = {
  bronze: {
    label: 'Bronze',
    gradient: 'from-amber-600 to-amber-700',
    border: 'border-amber-600/30',
    text: 'text-amber-600',
  },
  silver: {
    label: 'Silver',
    gradient: 'from-slate-300 to-slate-400',
    border: 'border-slate-400/30',
    text: 'text-slate-400',
  },
  gold: {
    label: 'Gold',
    gradient: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-500/30',
    text: 'text-yellow-500',
  },
  platinum: {
    label: 'Platinum',
    gradient: 'from-cyan-300 to-cyan-500',
    border: 'border-cyan-400/30',
    text: 'text-cyan-400',
  },
  diamond: {
    label: 'Diamond',
    gradient: 'from-violet-400 to-purple-600',
    border: 'border-violet-500/30',
    text: 'text-violet-500',
  },
};

const RARITY_CONFIG: Record<BadgeRarity, { label: string; color: string; bg: string }> = {
  common: { label: 'Common', color: 'text-silver-mist', bg: 'bg-silver-mist/10' },
  uncommon: { label: 'Uncommon', color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
  rare: { label: 'Rare', color: 'text-celestial-indigo', bg: 'bg-celestial-indigo/10' },
  epic: { label: 'Epic', color: 'text-nebula-purple', bg: 'bg-nebula-purple/10' },
  legendary: { label: 'Legendary', color: 'text-sunset-amber', bg: 'bg-sunset-amber/10' },
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_BADGES: BadgeData[] = [
  {
    id: 'b-1',
    name: 'Team Player',
    description: 'Recognized 10+ times for teamwork',
    icon: '🤝',
    level: 'gold',
    rarity: 'uncommon',
    category: 'Teamwork',
    criteria: 'Receive 10 teamwork recognitions',
    pointsValue: 500,
    isEarned: true,
    earnedDate: '2026-01-15',
    earnedCount: 3,
    totalAwarded: 142,
  },
  {
    id: 'b-2',
    name: 'Innovation Champion',
    description: 'Led a successful innovation initiative',
    icon: '💡',
    level: 'platinum',
    rarity: 'rare',
    category: 'Innovation',
    criteria: 'Receive 5 innovation recognitions',
    pointsValue: 750,
    isEarned: true,
    earnedDate: '2026-02-10',
    earnedCount: 1,
    totalAwarded: 38,
  },
  {
    id: 'b-3',
    name: 'Customer Hero',
    description: 'Went above and beyond for customers',
    icon: '🦸',
    level: 'silver',
    rarity: 'uncommon',
    category: 'Customer Focus',
    criteria: 'Receive 5 customer focus recognitions',
    pointsValue: 300,
    isEarned: true,
    earnedDate: '2025-12-20',
    earnedCount: 2,
    totalAwarded: 89,
  },
  {
    id: 'b-4',
    name: 'Quality Star',
    description: 'Consistently delivers excellence',
    icon: '⭐',
    level: 'gold',
    rarity: 'rare',
    category: 'Excellence',
    criteria: 'Receive 15 excellence recognitions',
    pointsValue: 500,
    isEarned: false,
    progress: 11,
    progressMax: 15,
    totalAwarded: 56,
  },
  {
    id: 'b-5',
    name: 'Culture Champion',
    description: 'Embodies all company core values',
    icon: '🏆',
    level: 'diamond',
    rarity: 'legendary',
    category: 'Culture',
    criteria: 'Earn badges in all 5 core value categories',
    pointsValue: 2000,
    isEarned: false,
    progress: 3,
    progressMax: 5,
    totalAwarded: 8,
  },
  {
    id: 'b-6',
    name: 'Mentor of the Month',
    description: 'Actively mentored colleagues',
    icon: '🎓',
    level: 'silver',
    rarity: 'uncommon',
    category: 'Leadership',
    criteria: 'Receive 5 mentoring recognitions in a month',
    pointsValue: 400,
    isEarned: true,
    earnedDate: '2026-02-01',
    earnedCount: 1,
    totalAwarded: 67,
  },
  {
    id: 'b-7',
    name: 'First Responder',
    description: 'Resolved a critical incident',
    icon: '🚨',
    level: 'gold',
    rarity: 'rare',
    category: 'Excellence',
    criteria: 'Recognized for incident response',
    pointsValue: 600,
    isEarned: false,
    progress: 0,
    progressMax: 1,
    totalAwarded: 22,
  },
  {
    id: 'b-8',
    name: 'Integrity Guardian',
    description: 'Upheld ethical standards',
    icon: '🛡️',
    level: 'platinum',
    rarity: 'epic',
    category: 'Integrity',
    criteria: 'Receive 10 integrity recognitions',
    pointsValue: 800,
    isEarned: false,
    progress: 6,
    progressMax: 10,
    totalAwarded: 15,
  },
  {
    id: 'b-9',
    name: 'Welcome Ambassador',
    description: 'Helped onboard new team members',
    icon: '👋',
    level: 'bronze',
    rarity: 'common',
    category: 'Teamwork',
    criteria: 'Help onboard 3 new employees',
    pointsValue: 150,
    isEarned: true,
    earnedDate: '2025-11-05',
    earnedCount: 2,
    totalAwarded: 234,
  },
  {
    id: 'b-10',
    name: '100 Club',
    description: 'Gave 100 recognitions to others',
    icon: '💯',
    level: 'diamond',
    rarity: 'legendary',
    category: 'Culture',
    criteria: 'Give 100 total recognitions',
    pointsValue: 1500,
    isEarned: false,
    progress: 47,
    progressMax: 100,
    totalAwarded: 3,
  },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const RecognitionBadges: React.FC<RecognitionBadgesProps> = ({ badges, totalPoints }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'earned' | 'locked'>('all');

  const earned = badges.filter((b) => b.isEarned);
  const locked = badges.filter((b) => !b.isEarned);
  const filtered = filterStatus === 'all' ? badges : filterStatus === 'earned' ? earned : locked;

  return (
    <div className="space-y-3">
      {/* Summary Bar */}
      <div className="flex items-center gap-4 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-sunset-amber/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-sunset-amber" />
          </div>
          <div>
            <p className="text-[14px] font-black text-ink-black dark:text-pearl">{earned.length}</p>
            <p className="text-[7px] text-silver-mist font-semibold">Badges Earned</p>
          </div>
        </div>
        <div className="w-px h-8 bg-cloud dark:bg-nebula-purple/20" />
        <div>
          <p className="text-[14px] font-black text-ink-black dark:text-pearl">{locked.length}</p>
          <p className="text-[7px] text-silver-mist font-semibold">Locked</p>
        </div>
        <div className="w-px h-8 bg-cloud dark:bg-nebula-purple/20" />
        <div>
          <p className="text-[14px] font-black text-sunset-amber">{totalPoints.toLocaleString()}</p>
          <p className="text-[7px] text-silver-mist font-semibold">Total Points</p>
        </div>
        <div className="flex-1" />
        <div className="flex rounded-lg border border-cloud dark:border-nebula-purple/20 overflow-hidden">
          {(['all', 'earned', 'locked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-2 py-1 text-[8px] font-bold transition-colors ${
                filterStatus === f
                  ? 'bg-celestial-indigo text-white'
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              {f === 'all'
                ? `All (${badges.length})`
                : f === 'earned'
                  ? `Earned (${earned.length})`
                  : `Locked (${locked.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((badge) => {
          const levelCfg = LEVEL_CONFIG[badge.level];
          const rarityCfg = RARITY_CONFIG[badge.rarity];
          const progressPct = badge.progressMax
            ? Math.round(((badge.progress || 0) / badge.progressMax) * 100)
            : 0;

          return (
            <div
              key={badge.id}
              className={`rounded-xl border p-3 transition-colors ${
                badge.isEarned
                  ? `${levelCfg.border} bg-white dark:bg-stellar-blue`
                  : 'border-cloud dark:border-nebula-purple/20 bg-cloud/30 dark:bg-nebula-purple/5 opacity-75'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Badge Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    badge.isEarned
                      ? `bg-gradient-to-br ${levelCfg.gradient} shadow-sm`
                      : 'bg-silver-mist/20'
                  }`}
                >
                  {badge.isEarned ? badge.icon : <Lock className="w-5 h-5 text-silver-mist" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-ink-black dark:text-pearl truncate">
                      {badge.name}
                    </span>
                    {badge.isEarned && (
                      <CheckCircle2 className="w-3 h-3 text-neural-mint shrink-0" />
                    )}
                  </div>
                  <p className="text-[8px] text-silver-mist mt-0.5">{badge.description}</p>

                  {/* Level + Rarity */}
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`px-1 py-0.5 rounded text-[7px] font-bold ${levelCfg.text} bg-current/10`}
                    >
                      {levelCfg.label}
                    </span>
                    <span
                      className={`px-1 py-0.5 rounded text-[7px] font-bold ${rarityCfg.color} ${rarityCfg.bg}`}
                    >
                      {rarityCfg.label}
                    </span>
                    <span className="text-[7px] text-silver-mist flex items-center gap-0.5">
                      <Zap className="w-2 h-2" /> {badge.pointsValue} pts
                    </span>
                  </div>

                  {/* Progress for locked */}
                  {!badge.isEarned && badge.progressMax && (
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between text-[7px] mb-0.5">
                        <span className="text-silver-mist">{badge.criteria}</span>
                        <span className="font-bold text-ink-black dark:text-pearl">
                          {badge.progress}/{badge.progressMax}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-cloud dark:bg-nebula-purple/20">
                        <div
                          className={`h-full rounded-full transition-all ${progressPct >= 80 ? 'bg-neural-mint' : progressPct >= 50 ? 'bg-celestial-indigo' : 'bg-sunset-amber'}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Earned info */}
                  {badge.isEarned && badge.earnedDate && (
                    <div className="flex items-center gap-2 mt-1 text-[7px] text-silver-mist">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        Earned{' '}
                        {new Date(badge.earnedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {badge.earnedCount && badge.earnedCount > 1 && (
                        <span>×{badge.earnedCount}</span>
                      )}
                    </div>
                  )}

                  {/* Rarity stat */}
                  <p className="text-[7px] text-silver-mist mt-0.5">
                    {badge.totalAwarded} people have earned this badge
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecognitionBadges;
