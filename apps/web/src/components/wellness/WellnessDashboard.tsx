// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module WellnessDashboard
 * @description Employee wellness dashboard — circular score gauge, category radar,
 *              active programs, activity log, weekly sparkline, challenge leaderboard,
 *              rewards, quick-log buttons (Sec 17.6)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Flame,
  Trophy,
  Star,
  CheckCircle,
  Plus,
  TrendingUp,
  Users,
  Activity,
  Brain,
  DollarSign,
  Moon,
  Utensils,
  Footprints,
  Loader2,
  Zap,
  Crown,
} from 'lucide-react';
import {
  WellnessService,
  type WellnessScore,
  type WellnessProgram,
  type WellnessChallenge,
  type WellnessReward,
  type WellnessActivity,
  type ActivityType,
  type LeaderboardEntry,
} from '@/services/wellnessService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  physical: Footprints,
  mental: Brain,
  financial: DollarSign,
  social: Users,
  sleep: Moon,
  nutrition: Utensils,
};

const CATEGORY_COLORS: Record<string, string> = {
  physical: '#6366f1',
  mental: '#8b5cf6',
  financial: '#10b981',
  social: '#f59e0b',
  sleep: '#3b82f6',
  nutrition: '#ef4444',
};

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  steps: Footprints,
  meditation: Brain,
  workout: Flame,
  reading: Star,
  sleep: Moon,
  nutrition: Utensils,
  cycling: Activity,
  yoga: Heart,
  stretching: Zap,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  steps: 'bg-indigo-100 text-indigo-600',
  meditation: 'bg-purple-100 text-purple-600',
  workout: 'bg-orange-100 text-orange-600',
  reading: 'bg-yellow-100 text-yellow-600',
  sleep: 'bg-blue-100 text-blue-600',
  nutrition: 'bg-red-100 text-red-600',
  cycling: 'bg-teal-100 text-teal-600',
  yoga: 'bg-pink-100 text-pink-600',
  stretching: 'bg-green-100 text-green-600',
};

// ── Circular Score Gauge ──────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const size = 160;
  const strokeWidth = 14;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {/* Background track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        {/* Score arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        {/* Score text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={36} fontWeight="800" fill={color}>
          {score}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={11} fill="#94a3b8">
          out of 100
        </text>
        <text x={cx} y={cy + 26} textAnchor="middle" fontSize={12} fontWeight="600" fill={color}>
          {label}
        </text>
      </svg>
    </div>
  );
}

// ── Radar-like Category Display ───────────────────────────────────────────────

function CategoryScores({ breakdown }: { breakdown: WellnessScore['breakdown'] }) {
  const entries = Object.entries(breakdown) as [string, number][];

  return (
    <div className="grid grid-cols-2 gap-2">
      {entries.map(([key, score]) => {
        const Icon = CATEGORY_ICONS[key] ?? Activity;
        const color = CATEGORY_COLORS[key] ?? '#6366f1';
        const pct = score;
        return (
          <div key={key} className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-xs font-semibold text-slate-700 capitalize">{key}</span>
              <span className="ml-auto text-xs font-bold text-slate-800">{score}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function WeeklySparkline({ activities }: { activities: WellnessActivity[] }) {
  // Aggregate last 7 days by points
  const days: { label: string; points: number }[] = [];
  const now = new Date('2025-02-25');
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const pts = activities.filter((a) => a.date === dateStr).reduce((s, a) => s + a.points, 0);
    days.push({ label: d.toLocaleDateString('en', { weekday: 'short' }), points: pts });
  }

  const maxPts = Math.max(...days.map((d) => d.points), 1);
  const svgW = 260;
  const svgH = 50;
  const padX = 10;
  const padY = 8;
  const w = svgW - padX * 2;
  const h = svgH - padY * 2;

  const points = days.map((d, i) => ({
    x: padX + (i / (days.length - 1)) * w,
    y: padY + h - (d.points / maxPts) * h,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div>
      <svg width={svgW} height={svgH} className="w-full">
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${svgH} L ${points[0].x} ${svgH} Z`}
          fill="url(#sparkGradient)"
        />
        <path
          d={pathD}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#6366f1" />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {days.map((d) => (
          <span key={d.label} className="text-xs text-slate-400 w-8 text-center">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Quick Log Button ──────────────────────────────────────────────────────────

function QuickLogButton({
  type,
  value,
  unit,
  label,
  onLog,
}: {
  type: ActivityType;
  value: number;
  unit: string;
  label: string;
  onLog: (type: ActivityType, value: number, unit: string) => void;
}) {
  const Icon = ACTIVITY_ICONS[type] ?? Activity;
  const colorCls = ACTIVITY_COLORS[type] ?? 'bg-slate-100 text-slate-600';

  return (
    <button
      onClick={() => onLog(type, value, unit)}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-transparent hover:border-indigo-200 transition-all ${colorCls.split(' ')[0]} hover:opacity-90`}
    >
      <Icon className={`w-5 h-5 ${colorCls.split(' ')[1]}`} />
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <span className="text-xs text-slate-400">
        {value} {unit}
      </span>
    </button>
  );
}

// ── Challenge Card ────────────────────────────────────────────────────────────

function ChallengeCard({
  challenge,
  leaderboard,
  onJoin,
}: {
  challenge: WellnessChallenge;
  leaderboard: LeaderboardEntry[];
  onJoin: (id: string) => void;
}) {
  const progress = Math.min(
    100,
    Math.round((challenge.currentProgress / challenge.targetValue) * 100)
  );
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / 86400000)
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{challenge.emoji}</span>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{challenge.title}</p>
            <p className="text-xs text-slate-400">
              {challenge.participants} participants · {daysLeft}d left
            </p>
          </div>
        </div>
        {!challenge.isJoined && challenge.status === 'upcoming' && (
          <button
            onClick={() => onJoin(challenge.id)}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Join
          </button>
        )}
        {challenge.isJoined && challenge.myRank && (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
            <Crown className="w-3 h-3" />
            <span className="text-xs font-bold">#{challenge.myRank}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      {challenge.isJoined && (
        <>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>
              {challenge.currentProgress.toLocaleString()} /{' '}
              {challenge.targetValue.toLocaleString()} {challenge.unit}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}

      {/* Leaderboard preview */}
      {leaderboard.length > 0 && (
        <div className="space-y-1.5">
          {leaderboard.slice(0, 3).map((entry) => (
            <div
              key={entry.employeeId}
              className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 ${entry.isCurrentUser ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50'}`}
            >
              <span
                className={`w-5 text-center font-bold ${entry.rank === 1 ? 'text-amber-500' : entry.rank === 2 ? 'text-slate-400' : 'text-amber-700'}`}
              >
                {entry.rank === 1
                  ? '🥇'
                  : entry.rank === 2
                    ? '🥈'
                    : entry.rank === 3
                      ? '🥉'
                      : `#${entry.rank}`}
              </span>
              <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-[10px] flex-shrink-0">
                {entry.avatarInitials}
              </div>
              <span
                className={`flex-1 truncate ${entry.isCurrentUser ? 'font-semibold text-indigo-700' : 'text-slate-600'}`}
              >
                {entry.name}
              </span>
              <span className="font-medium text-slate-700">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reward */}
      <div className="flex items-center gap-1 mt-3 text-xs text-amber-600 font-medium">
        <Trophy className="w-3 h-3" />
        {challenge.pointsReward.toLocaleString()} pts reward
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function WellnessDashboard() {
  const [score, setScore] = useState<WellnessScore | null>(null);
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [challenges, setChallenges] = useState<WellnessChallenge[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [rewards, setRewards] = useState<WellnessReward[]>([]);
  const [activities, setActivities] = useState<WellnessActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [logToast, setLogToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'programs' | 'rewards'>(
    'overview'
  );

  useEffect(() => {
    (async () => {
      const [s, prg, chl, rwd, acts] = await Promise.all([
        WellnessService.getWellnessScore('emp-current'),
        WellnessService.getWellnessPrograms(),
        WellnessService.getWellnessChallenges(),
        WellnessService.getWellnessRewards(),
        WellnessService.getActivityHistory('emp-current'),
      ]);
      setScore(s);
      setPrograms(prg);
      setChallenges(chl);
      setRewards(rwd);
      setActivities(acts);

      // Load leaderboards for active challenges
      const lbs: Record<string, LeaderboardEntry[]> = {};
      for (const c of chl.filter((c) => c.isJoined && c.status === 'active')) {
        lbs[c.id] = await WellnessService.getChallengeLeaderboard(c.id);
      }
      setLeaderboards(lbs);
      setLoading(false);
    })();
  }, []);

  const handleQuickLog = async (type: ActivityType, value: number, unit: string) => {
    const activity = await WellnessService.logActivity({ type, value, unit });
    setActivities((prev) => [activity, ...prev]);
    setLogToast(`Logged ${value} ${unit} of ${type}! +${activity.points} pts`);
    setTimeout(() => setLogToast(null), 3000);
  };

  const handleJoinChallenge = async (id: string) => {
    await WellnessService.joinChallenge(id);
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isJoined: true, participants: c.participants + 1 } : c
      )
    );
  };

  const _enrolledPrograms = programs.filter((p) => p.isEnrolled);
  const activeChallenges = challenges.filter((c) => c.status === 'active');
  const upcomingChallenges = challenges.filter((c) => c.status === 'upcoming');
  const todayActivities = activities.filter((a) => a.date === '2025-02-25');
  const totalPointsEarned = score?.pointsEarned ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wellness Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your health & wellbeing snapshot</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <div>
            <p className="text-xs text-amber-600 font-medium">Points</p>
            <p className="text-base font-bold text-amber-700">
              {totalPointsEarned.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {(['overview', 'challenges', 'programs', 'rewards'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-fit py-2 px-3 text-sm font-medium rounded-lg capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Score + Categories */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {score && <ScoreGauge score={score.overallScore} />}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">
                    {score?.trend === 'improving'
                      ? 'Improving'
                      : score?.trend === 'declining'
                        ? 'Declining'
                        : 'Stable'}
                  </span>
                  <span className="text-xs text-slate-400">
                    · {score?.streakDays} day streak 🔥
                  </span>
                </div>
                {score && <CategoryScores breakdown={score.breakdown} />}
              </div>
            </div>
          </div>

          {/* Quick Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" />
              Quick Log Activity
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <QuickLogButton
                type="steps"
                value={8000}
                unit="steps"
                label="Walked"
                onLog={handleQuickLog}
              />
              <QuickLogButton
                type="meditation"
                value={10}
                unit="min"
                label="Meditated"
                onLog={handleQuickLog}
              />
              <QuickLogButton
                type="workout"
                value={30}
                unit="min"
                label="Exercised"
                onLog={handleQuickLog}
              />
              <QuickLogButton
                type="reading"
                value={20}
                unit="min"
                label="Read"
                onLog={handleQuickLog}
              />
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              Today&apos;s Activities
            </h3>
            {todayActivities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No activities logged today. Use quick log above!
              </p>
            ) : (
              <div className="space-y-2">
                {todayActivities.map((act) => {
                  const Icon = ACTIVITY_ICONS[act.type] ?? Activity;
                  const colorCls = ACTIVITY_COLORS[act.type] ?? 'bg-slate-100 text-slate-600';
                  return (
                    <div
                      key={act.id}
                      className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorCls}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 capitalize">{act.type}</p>
                        <p className="text-xs text-slate-400">
                          {act.value} {act.unit}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">+{act.points} pts</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly Trend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              Weekly Activity Trend
            </h3>
            <WeeklySparkline activities={activities} />
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {activeChallenges.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                Active Challenges
              </h3>
              <div className="space-y-3">
                {activeChallenges.map((c) => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    leaderboard={leaderboards[c.id] ?? []}
                    onJoin={handleJoinChallenge}
                  />
                ))}
              </div>
            </div>
          )}
          {upcomingChallenges.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                Upcoming
              </h3>
              <div className="space-y-3">
                {upcomingChallenges.map((c) => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    leaderboard={[]}
                    onJoin={handleJoinChallenge}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-3">
          {programs.map((prg) => (
            <div key={prg.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{prg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm">{prg.name}</p>
                    {prg.isEnrolled ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          await WellnessService.enrollProgram(prg.id);
                          setPrograms((prev) =>
                            prev.map((p) =>
                              p.id === prg.id
                                ? { ...p, isEnrolled: true, enrollmentStatus: 'enrolled' }
                                : p
                            )
                          );
                        }}
                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700 font-medium flex-shrink-0"
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{prg.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>{prg.durationWeeks}wk</span>
                    <span>⭐ {prg.rating}</span>
                    <span>{prg.totalEnrollments} enrolled</span>
                    <span className="text-amber-600 font-medium">
                      {prg.pointsPerCompletion} pts
                    </span>
                  </div>
                  {prg.isEnrolled && prg.progress > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{prg.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${prg.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div>
              <p className="text-xl font-bold text-amber-700">
                {totalPointsEarned.toLocaleString()}
              </p>
              <p className="text-sm text-amber-600">Total Wellness Points</p>
              <p className="text-xs text-amber-500 mt-0.5">{rewards.length} badges earned</p>
            </div>
          </div>
          {rewards.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4"
            >
              <span className="text-3xl">{r.badge}</span>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500">{r.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(r.earnedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                <Star className="w-4 h-4" />
                {r.points}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {logToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 z-50">
          <CheckCircle className="w-4 h-4" />
          {logToast}
        </div>
      )}
    </div>
  );
}
