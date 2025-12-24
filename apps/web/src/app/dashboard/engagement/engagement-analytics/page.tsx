"use client";

import React, { useState } from 'react';
import {
  Heart,
  Trophy,
  Users,
  Activity,
  TrendingUp,
  Award,
  Target,
  Star,
  Zap,
  Brain,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MessageCircle,
  Sparkles,
  RefreshCw,
  Download
} from 'lucide-react';

// ============================================================================
// MOCK DATA
// ============================================================================

const RECOGNITION_DATA = {
  totalRecognitions: 1245,
  thisMonth: 156,
  monthlyChange: 12.5,
  topCategories: [
    { name: 'Teamwork', nameAr: 'العمل الجماعي', count: 342, icon: '🤝' },
    { name: 'Innovation', nameAr: 'الابتكار', count: 287, icon: '💡' },
    { name: 'Leadership', nameAr: 'القيادة', count: 198, icon: '🏆' },
    { name: 'Customer Focus', nameAr: 'التركيز على العملاء', count: 176, icon: '⭐' },
    { name: 'Going Extra Mile', nameAr: 'بذل جهد إضافي', count: 142, icon: '🚀' },
  ],
  participationRate: 78,
  topRecognizers: [
    { name: 'Sarah Ahmed', department: 'Engineering', count: 45 },
    { name: 'Mohammed Ali', department: 'Sales', count: 38 },
    { name: 'Fatima Hassan', department: 'HR', count: 32 },
  ],
  topRecognized: [
    { name: 'Ahmed Khan', department: 'Engineering', count: 28, points: 1400 },
    { name: 'Layla Ibrahim', department: 'Marketing', count: 24, points: 1200 },
    { name: 'Omar Saeed', department: 'Product', count: 21, points: 1050 },
  ],
};

const GAMIFICATION_DATA = {
  activeUsers: 456,
  totalPoints: 125000,
  badgesAwarded: 892,
  challengesCompleted: 234,
  levelDistribution: [
    { level: 'Newcomer', count: 45, color: '#94A3B8' },
    { level: 'Contributor', count: 120, color: '#22C55E' },
    { level: 'Achiever', count: 180, color: '#3B82F6' },
    { level: 'Expert', count: 78, color: '#8B5CF6' },
    { level: 'Champion', count: 28, color: '#F59E0B' },
    { level: 'Legend', count: 5, color: '#EF4444' },
  ],
  topBadges: [
    { name: 'Team Player', icon: '🤝', earned: 234 },
    { name: 'Knowledge Seeker', icon: '📚', earned: 189 },
    { name: 'Streak Master', icon: '🔥', earned: 145 },
    { name: 'Wellness Warrior', icon: '💪', earned: 112 },
  ],
  weeklyLeaderboard: [
    { rank: 1, name: 'Ahmed Khan', points: 450, avatar: 'AK' },
    { rank: 2, name: 'Sarah Ahmed', points: 420, avatar: 'SA' },
    { rank: 3, name: 'Mohammed Ali', points: 385, avatar: 'MA' },
    { rank: 4, name: 'Fatima Hassan', points: 340, avatar: 'FH' },
    { rank: 5, name: 'Layla Ibrahim', points: 315, avatar: 'LI' },
  ],
};

const WELLNESS_DATA = {
  averageScore: 72,
  scoreChange: 3.5,
  activeParticipants: 385,
  participationRate: 77,
  categoryScores: [
    { category: 'Physical Fitness', score: 68, icon: '🏃', color: '#EF4444' },
    { category: 'Mental Health', score: 74, icon: '🧠', color: '#8B5CF6' },
    { category: 'Nutrition', score: 65, icon: '🥗', color: '#22C55E' },
    { category: 'Sleep', score: 71, icon: '😴', color: '#3B82F6' },
    { category: 'Work-Life Balance', score: 78, icon: '⚖️', color: '#F59E0B' },
    { category: 'Stress Management', score: 70, icon: '🧘', color: '#EC4899' },
  ],
  activeChallenges: 8,
  challengeCompletionRate: 65,
  topActivities: [
    { name: 'Daily Steps', participants: 234 },
    { name: 'Meditation', participants: 156 },
    { name: 'Hydration', participants: 189 },
    { name: 'Workout', participants: 145 },
  ],
};

const DEI_DATA = {
  diversityScore: 72,
  scoreChange: 2.8,
  inclusionScore: 78,
  genderDistribution: [
    { category: 'Male', percentage: 55 },
    { category: 'Female', percentage: 43 },
    { category: 'Non-Binary', percentage: 2 },
  ],
  ageDistribution: [
    { category: '18-25', percentage: 15 },
    { category: '26-35', percentage: 42 },
    { category: '36-45', percentage: 28 },
    { category: '46-55', percentage: 12 },
    { category: '55+', percentage: 3 },
  ],
  payEquityGap: 3.2,
  leadershipDiversity: 35,
  ergCount: 6,
  ergMembers: 245,
  upcomingSurvey: 'Q1 Inclusion Pulse Check',
};

const ENGAGEMENT_TREND = [
  { month: 'Jul', recognition: 120, wellness: 65, gamification: 180 },
  { month: 'Aug', recognition: 135, wellness: 68, gamification: 195 },
  { month: 'Sep', recognition: 142, wellness: 70, gamification: 210 },
  { month: 'Oct', recognition: 138, wellness: 71, gamification: 225 },
  { month: 'Nov', recognition: 148, wellness: 72, gamification: 245 },
  { month: 'Dec', recognition: 156, wellness: 72, gamification: 260 },
];

// ============================================================================
// COMPONENTS
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, subtitle, change, icon, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-ink-black dark:text-pearl">{value}</p>
        <p className="text-sm text-silver-mist mt-1">{title}</p>
        {subtitle && <p className="text-xs text-silver-mist mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function ProgressRing({ value, size = 80, strokeWidth = 8, color = '#8B5CF6' }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-ink-black dark:text-pearl">{value}%</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function EngagementAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500" />
            Engagement Analytics
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Recognition, Gamification, Wellness & DEI insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 border border-cloud dark:border-nebula-purple/50 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`w-5 h-5 text-silver-mist ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Recognition Rate"
          value={`${RECOGNITION_DATA.participationRate}%`}
          subtitle={`${RECOGNITION_DATA.thisMonth} this month`}
          change={RECOGNITION_DATA.monthlyChange}
          icon={<Star className="w-6 h-6 text-amber-600" />}
          color="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard
          title="Gamification Users"
          value={GAMIFICATION_DATA.activeUsers}
          subtitle={`${GAMIFICATION_DATA.totalPoints.toLocaleString()} total points`}
          change={8.5}
          icon={<Trophy className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          title="Wellness Score"
          value={`${WELLNESS_DATA.averageScore}%`}
          subtitle={`${WELLNESS_DATA.activeParticipants} participants`}
          change={WELLNESS_DATA.scoreChange}
          icon={<Activity className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard
          title="Inclusion Score"
          value={`${DEI_DATA.inclusionScore}%`}
          subtitle={`Diversity: ${DEI_DATA.diversityScore}%`}
          change={DEI_DATA.scoreChange}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recognition Section */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            Recognition
          </h2>

          <div className="space-y-4">
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p className="text-3xl font-bold text-amber-600">{RECOGNITION_DATA.totalRecognitions}</p>
              <p className="text-sm text-silver-mist">Total Recognitions</p>
            </div>

            <h3 className="text-sm font-medium text-silver-mist">Top Categories</h3>
            <div className="space-y-2">
              {RECOGNITION_DATA.topCategories.slice(0, 4).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm text-ink-black dark:text-pearl">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium text-amber-600">{cat.count}</span>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-medium text-silver-mist mt-4">Top Recognized</h3>
            <div className="space-y-2">
              {RECOGNITION_DATA.topRecognized.map((person, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">{person.name}</p>
                      <p className="text-xs text-silver-mist">{person.department}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{person.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gamification Section */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-purple-500" />
            Gamification
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
              <p className="text-xl font-bold text-purple-600">{GAMIFICATION_DATA.badgesAwarded}</p>
              <p className="text-xs text-silver-mist">Badges Awarded</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
              <p className="text-xl font-bold text-indigo-600">{GAMIFICATION_DATA.challengesCompleted}</p>
              <p className="text-xs text-silver-mist">Challenges Done</p>
            </div>
          </div>

          <h3 className="text-sm font-medium text-silver-mist mb-3">Level Distribution</h3>
          <div className="flex items-end gap-1 h-24 mb-4">
            {GAMIFICATION_DATA.levelDistribution.map((level, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium" style={{ color: level.color }}>{level.count}</span>
                <div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${(level.count / 180) * 100}%`,
                    backgroundColor: level.color,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-silver-mist">
            {GAMIFICATION_DATA.levelDistribution.map((level, idx) => (
              <span key={idx} className="truncate">{level.level.charAt(0)}</span>
            ))}
          </div>

          <h3 className="text-sm font-medium text-silver-mist mt-4 mb-3">Weekly Leaders</h3>
          <div className="space-y-2">
            {GAMIFICATION_DATA.weeklyLeaderboard.slice(0, 3).map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-amber-400 text-white' :
                    idx === 1 ? 'bg-slate-300 text-slate-700' :
                    'bg-amber-700 text-white'
                  }`}>
                    {entry.rank}
                  </div>
                  <span className="text-sm text-ink-black dark:text-pearl">{entry.name}</span>
                </div>
                <span className="text-sm font-bold text-purple-600">{entry.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wellness Section */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-500" />
            Wellness
          </h2>

          <div className="flex items-center justify-center mb-4">
            <ProgressRing value={WELLNESS_DATA.averageScore} size={100} color="#10B981" />
          </div>
          <p className="text-center text-sm text-silver-mist mb-4">Average Wellness Score</p>

          <h3 className="text-sm font-medium text-silver-mist mb-3">Category Breakdown</h3>
          <div className="space-y-2">
            {WELLNESS_DATA.categoryScores.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-lg">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink-black dark:text-pearl">{cat.category}</span>
                    <span className="font-medium" style={{ color: cat.color }}>{cat.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-silver-mist">Active Challenges</span>
              <span className="text-lg font-bold text-emerald-600">{WELLNESS_DATA.activeChallenges}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-silver-mist">Completion Rate</span>
              <span className="text-lg font-bold text-emerald-600">{WELLNESS_DATA.challengeCompletionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* DEI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            Diversity & Inclusion
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <ProgressRing value={DEI_DATA.diversityScore} size={80} color="#3B82F6" />
              <p className="text-sm text-silver-mist mt-2">Diversity Score</p>
            </div>
            <div className="text-center">
              <ProgressRing value={DEI_DATA.inclusionScore} size={80} color="#8B5CF6" />
              <p className="text-sm text-silver-mist mt-2">Inclusion Score</p>
            </div>
          </div>

          <h3 className="text-sm font-medium text-silver-mist mb-3">Gender Distribution</h3>
          <div className="flex items-center gap-2 mb-4">
            {DEI_DATA.genderDistribution.map((g, idx) => (
              <div
                key={idx}
                className="h-4 rounded-full first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${g.percentage}%`,
                  backgroundColor: idx === 0 ? '#3B82F6' : idx === 1 ? '#EC4899' : '#8B5CF6',
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-silver-mist">
            {DEI_DATA.genderDistribution.map((g, idx) => (
              <span key={idx}>{g.category} ({g.percentage}%)</span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xl font-bold text-blue-600">{DEI_DATA.leadershipDiversity}%</p>
              <p className="text-xs text-silver-mist">Women in Leadership</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <p className="text-xl font-bold text-emerald-600">{DEI_DATA.payEquityGap}%</p>
              <p className="text-xs text-silver-mist">Adjusted Pay Gap</p>
            </div>
          </div>
        </div>

        {/* Engagement Trend */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Engagement Trend
          </h2>

          <div className="h-48 flex items-end gap-4">
            {ENGAGEMENT_TREND.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col gap-1">
                <div className="flex flex-col-reverse gap-1 flex-1">
                  <div
                    className="bg-amber-400 rounded-t"
                    style={{ height: `${(data.recognition / 260) * 100}%` }}
                  />
                  <div
                    className="bg-emerald-400 rounded-t"
                    style={{ height: `${(data.wellness / 260) * 100}%` }}
                  />
                  <div
                    className="bg-purple-400 rounded-t"
                    style={{ height: `${(data.gamification / 260) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-silver-mist text-center">{data.month}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-400" />
              <span className="text-xs text-silver-mist">Recognition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-400" />
              <span className="text-xs text-silver-mist">Wellness</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-400" />
              <span className="text-xs text-silver-mist">Gamification</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-rose-500 to-purple-600 p-6 rounded-xl text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-2">AI-Generated Engagement Insights</h2>
            <ul className="space-y-2 text-sm text-white/90">
              <li className="flex items-start gap-2">
                <span className="text-amber-300">•</span>
                Recognition participation up 12.5% - Teamwork remains the top valued category
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-300">•</span>
                Wellness score improved by 3.5% - Focus on Nutrition category for further gains
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-300">•</span>
                Inclusion score at 78% - Consider targeted initiatives for growth opportunities
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-300">•</span>
                Gamification driving 456 active users - Badge completion rate trending upward
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
