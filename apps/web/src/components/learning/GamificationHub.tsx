// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module GamificationHub
 * @description Learning Gamification Hub — player card with XP bar, badge showcase,
 *              leaderboard with rank changes, streaks, quests, points history (Sec 21.5)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Target,
  TrendingUp,
  TrendingDown,
  Star,
  Minus,
  RefreshCw,
  Zap,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  GamificationService,
  type PlayerProfile,
  type Badge,
  type LeaderboardEntry,
  type Streak,
  type Quest,
  type PointTransaction,
  type LevelDefinition,
} from '@/services/gamificationService';

// ── XP Bar ────────────────────────────────────────────────────────────────────

function _XPBar({
  current,
  min,
  max,
  color,
}: {
  current: number;
  min: number;
  max: number;
  color: string;
}) {
  const range = max - min;
  const pct = Math.max(0, Math.min(100, ((current - min) / range) * 100));
  return (
    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ── Player Card ───────────────────────────────────────────────────────────────

function PlayerCard({ player, levelDef }: { player: PlayerProfile; levelDef?: LevelDefinition }) {
  const xpProgress = player.totalXP - player.xpForCurrentLevel;
  const xpRange = player.xpForNextLevel - player.xpForCurrentLevel;
  const pct = ((xpProgress / xpRange) * 100).toFixed(0);
  const color = levelDef?.color ?? '#6366f1';

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-2 border-white/30 flex-shrink-0"
          style={{ background: `${color}80` }}
        >
          {player.avatarInitials}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg">{player.name}</h3>
              <p className="text-indigo-200 text-sm">
                {player.title} · {player.department}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-2xl font-bold">#{player.rank}</span>
              </div>
              <p className="text-indigo-200 text-xs">of {player.totalRank}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-200">Level {player.level}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">
                  {player.levelTitle}
                </span>
              </div>
              <span className="text-xs text-indigo-200">
                {player.totalXP.toLocaleString()} XP total
              </span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-indigo-200">{xpProgress.toLocaleString()} XP</span>
              <span className="text-xs text-indigo-200">
                {xpRange.toLocaleString()} to Level {player.level + 1}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: 'Badges', value: player.badgeCount, icon: <Award size={14} /> },
          { label: 'Courses', value: player.courseCompleted, icon: <CheckCircle size={14} /> },
          { label: 'Day Streak', value: player.streakDays, icon: <Flame size={14} /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/10 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">{stat.icon}</div>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-indigo-200">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Badge Grid ────────────────────────────────────────────────────────────────

function BadgeGrid({ badges }: { badges: Badge[] }) {
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
  const sorted = [...badges].sort((a, b) => {
    if (a.isEarned !== b.isEarned) return a.isEarned ? -1 : 1;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const rarityColors: Record<string, string> = {
    legendary: 'border-yellow-400 bg-yellow-50',
    epic: 'border-purple-400 bg-purple-50',
    rare: 'border-blue-400 bg-blue-50',
    uncommon: 'border-green-400 bg-green-50',
    common: 'border-gray-300 bg-gray-50',
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {sorted.map((badge) => (
        <div
          key={badge.id}
          className={`relative p-2 border-2 rounded-xl text-center transition-all ${badge.isEarned ? rarityColors[badge.rarity] : 'border-gray-200 bg-gray-50 opacity-40 grayscale'}`}
          title={`${badge.name}: ${badge.description}`}
        >
          <div className="text-2xl mb-0.5">{badge.emoji}</div>
          <p className="text-xs font-medium text-gray-700 leading-tight line-clamp-1">
            {badge.name}
          </p>
          <p className="text-xs text-gray-400">+{badge.xpReward}</p>
          {badge.isEarned && badge.rarity !== 'common' && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border border-white" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const RankChange = ({ entry }: { entry: LeaderboardEntry }) => {
    const change = entry.previousRank - entry.rank;
    if (change > 0)
      return (
        <span className="flex items-center text-green-500 text-xs">
          <TrendingUp size={11} />+{change}
        </span>
      );
    if (change < 0)
      return (
        <span className="flex items-center text-red-500 text-xs">
          <TrendingDown size={11} />
          {change}
        </span>
      );
    return (
      <span className="text-gray-400 text-xs">
        <Minus size={11} />
      </span>
    );
  };

  const rankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700 font-bold';
    if (rank === 2) return 'bg-gray-100 text-gray-600 font-bold';
    if (rank === 3) return 'bg-orange-100 text-orange-700 font-bold';
    return 'bg-gray-50 text-gray-500';
  };

  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div
          key={entry.employeeId}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${entry.isCurrentUser ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${rankStyle(entry.rank)}`}
          >
            {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {entry.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium truncate ${entry.isCurrentUser ? 'text-indigo-800' : 'text-gray-800'}`}
            >
              {entry.name}{' '}
              {entry.isCurrentUser && <span className="text-xs text-indigo-500">(you)</span>}
            </p>
            <p className="text-xs text-gray-400">
              {entry.department} · Lvl {entry.level}
            </p>
          </div>
          <RankChange entry={entry} />
          <div className="text-right text-xs hidden md:block">
            <p className="font-bold text-gray-800">{entry.totalXP.toLocaleString()}</p>
            <p className="text-gray-400">XP</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Streak Cards ──────────────────────────────────────────────────────────────

function StreakCards({ streaks }: { streaks: Streak[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {streaks.map((streak) => {
        const pct = (streak.currentStreak / streak.nextMilestone) * 100;
        return (
          <div
            key={streak.type}
            className={`p-3 rounded-xl border ${streak.isActive ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50 opacity-70'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{streak.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{streak.label}</p>
                <p className="text-xs text-gray-400">{streak.xpPerDay} XP/day</p>
              </div>
              <div className="ml-auto text-right">
                <p
                  className={`text-lg font-bold ${streak.isActive ? 'text-orange-600' : 'text-gray-400'}`}
                >
                  {streak.currentStreak}
                </p>
                <p className="text-xs text-gray-400">days</p>
              </div>
            </div>
            <div className="h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Next milestone: {streak.nextMilestone} days
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Quest Cards ───────────────────────────────────────────────────────────────

function QuestCard({ quest, _onComplete }: { quest: Quest; onComplete: (id: string) => void }) {
  const pct = (quest.progress / quest.target) * 100;
  const statusColors = {
    available: 'border-blue-200 bg-blue-50',
    in_progress: 'border-green-200 bg-green-50',
    completed: 'border-gray-200 bg-gray-50',
    expired: 'border-red-200 bg-red-50',
  };

  return (
    <div className={`p-4 border rounded-xl ${statusColors[quest.status]}`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{quest.emoji}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 text-sm">{quest.title}</h4>
            <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
              <Zap size={11} />+{quest.xpReward.toLocaleString()} XP
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 mb-2">{quest.description}</p>
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-gray-500">
              {quest.progress}/{quest.target} {quest.unit}
            </span>
            {quest.expiresAt && (
              <span className="flex items-center gap-1 text-gray-400">
                <Clock size={10} />
                Expires {new Date(quest.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${quest.status === 'completed' ? 'bg-gray-400' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="mt-2 space-y-1">
            {quest.tasks.map((task, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 text-xs ${task.done ? 'text-green-600' : 'text-gray-500'}`}
              >
                {task.done ? (
                  <CheckCircle size={11} />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />
                )}
                {task.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Weekly XP Chart ───────────────────────────────────────────────────────────

function WeeklyXPChart({ data }: { data: number[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(...data) || 1;
  const W = 320;
  const H = 80;
  const padL = 10;
  const padR = 10;
  const padT = 10;
  const padB = 25;
  const barW = (W - padL - padR) / data.length - 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {data.map((v, i) => {
        const bh = (v / max) * (H - padT - padB);
        const bx = padL + i * ((W - padL - padR) / data.length) + 2;
        const by = H - padB - bh;
        const isToday = i === 6;
        return (
          <g key={i}>
            <rect
              x={bx}
              y={by}
              width={barW}
              height={bh}
              rx={3}
              fill={isToday ? '#6366f1' : '#c7d2fe'}
            />
            <text
              x={bx + barW / 2}
              y={H - padB + 10}
              textAnchor="middle"
              fontSize={8}
              fill="#9ca3af"
            >
              {days[i]}
            </text>
            {v > 0 && (
              <text
                x={bx + barW / 2}
                y={by - 3}
                textAnchor="middle"
                fontSize={8}
                fill={isToday ? '#4338ca' : '#9ca3af'}
              >
                {v}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabType = 'profile' | 'badges' | 'leaderboard' | 'quests';

export default function GamificationHub() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [history, setHistory] = useState<PointTransaction[]>([]);
  const [weeklyXP, setWeeklyXP] = useState<number[]>([]);
  const [levels, setLevels] = useState<LevelDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [lbPeriod, setLbPeriod] = useState<'week' | 'month' | 'all_time'>('month');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, b, lb, s, q, h, w, l] = await Promise.all([
        GamificationService.getPoints('emp-current'),
        GamificationService.getAvailableBadges(),
        GamificationService.getLeaderboard('month'),
        GamificationService.getStreaks('emp-current'),
        GamificationService.getQuests(),
        GamificationService.getPointsHistory('emp-current'),
        GamificationService.getWeeklyXP('emp-current'),
        GamificationService.getLevelDefinitions(),
      ]);
      setPlayer(p);
      setBadges(b);
      setLeaderboard(lb);
      setStreaks(s);
      setQuests(q);
      setHistory(h);
      setWeeklyXP(w);
      setLevels(l);
      setLoading(false);
    };
    load();
  }, []);

  const currentLevelDef = player ? levels.find((l) => l.level === player.level) : undefined;

  const TABS = [
    { id: 'profile' as TabType, label: 'My Progress', icon: <Star size={14} /> },
    { id: 'badges' as TabType, label: 'Badges', icon: <Award size={14} /> },
    { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: <Trophy size={14} /> },
    { id: 'quests' as TabType, label: 'Quests', icon: <Target size={14} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6 bg-gray-50 min-h-screen">
      {/* Player Card */}
      {player && <PlayerCard player={player} levelDef={currentLevelDef} />}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {/* My Progress Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">This Week&apos;s XP</h4>
                <WeeklyXPChart data={weeklyXP} />
                <p className="text-xs text-gray-400 mt-1">
                  Total this week: {weeklyXP.reduce((s, v) => s + v, 0)} XP
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Active Streaks</h4>
                <StreakCards streaks={streaks} />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Points</h4>
                <div className="space-y-2">
                  {history.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap size={14} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{tx.reason}</p>
                        <p className="text-xs text-gray-400">{tx.date}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">+{tx.points}</span>
                    </div>
                  ))}
                </div>
              </div>

              {currentLevelDef?.perks && (
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-indigo-800 mb-2">
                    Level {player?.level} Perks
                  </h4>
                  <ul className="space-y-1">
                    {currentLevelDef.perks.map((perk) => (
                      <li key={perk} className="text-xs text-indigo-700 flex items-center gap-1.5">
                        <CheckCircle size={11} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-500">
                  {badges.filter((b) => b.isEarned).length}/{badges.length} badges earned
                </p>
                <div className="flex items-center gap-3 text-xs">
                  {[
                    { r: 'legendary', l: 'Legendary' },
                    { r: 'epic', l: 'Epic' },
                    { r: 'rare', l: 'Rare' },
                    { r: 'uncommon', l: 'Uncommon' },
                  ].map((item) => (
                    <div key={item.r} className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${item.r === 'legendary' ? 'bg-yellow-400' : item.r === 'epic' ? 'bg-purple-500' : item.r === 'rare' ? 'bg-blue-500' : 'bg-green-500'}`}
                      />
                      <span className="text-gray-400">{item.l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <BadgeGrid badges={badges} />
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {(['week', 'month', 'all_time'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setLbPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${lbPeriod === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
                  </button>
                ))}
              </div>
              <Leaderboard entries={leaderboard} />
            </div>
          )}

          {/* Quests Tab */}
          {activeTab === 'quests' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {quests.filter((q) => q.status === 'in_progress').length} active ·{' '}
                  {quests.filter((q) => q.status === 'available').length} available
                </span>
                <span>
                  Total available XP: {quests.reduce((s, q) => s + q.xpReward, 0).toLocaleString()}
                </span>
              </div>
              <div className="space-y-3">
                {quests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={(id) => GamificationService.completeQuest(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
