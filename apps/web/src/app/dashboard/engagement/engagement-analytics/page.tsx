"use client";

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Trophy,
  Users,
  Activity,
  TrendingUp,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Download,
  Loader2
} from 'lucide-react';
import { EngagementAnalyticsService } from '../services';

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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-ink-black dark:text-pearl">{value}%</span>
      </div>
    </div>
  );
}

export default function EngagementAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await EngagementAnalyticsService.getMetrics();
      const data = (result as any)?.data || result;
      setMetrics(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => setIsRefreshing(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const recognitionsGiven = metrics?.recognitionsGiven || 0;
  const recognitionsReceived = metrics?.recognitionsReceived || 0;
  const totalRecognitionPoints = metrics?.totalRecognitionPoints || 0;
  const surveyParticipationRate = metrics?.surveyParticipationRate || 0;
  const overallEngagementScore = metrics?.overallEngagementScore || 0;
  const socialPosts = metrics?.socialPosts || 0;
  const eNPSScore = metrics?.eNPSScore || 0;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Recognition Activity"
          value={recognitionsGiven}
          subtitle={`${totalRecognitionPoints} total points`}
          icon={<Star className="w-6 h-6 text-amber-600" />}
          color="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard
          title="Social Posts"
          value={socialPosts}
          subtitle="Posts & recognitions"
          icon={<Trophy className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          title="Survey Participation"
          value={`${surveyParticipationRate}%`}
          subtitle="Response rate"
          icon={<Activity className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard
          title="eNPS Score"
          value={eNPSScore}
          subtitle={`Engagement: ${overallEngagementScore}%`}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            Recognition
          </h2>
          <div className="space-y-4">
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p className="text-3xl font-bold text-amber-600">{recognitionsGiven}</p>
              <p className="text-sm text-silver-mist">Total Recognitions</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <p className="text-3xl font-bold text-indigo-600">{totalRecognitionPoints}</p>
              <p className="text-sm text-silver-mist">Total Points Awarded</p>
            </div>
            {recognitionsGiven === 0 && (
              <div className="text-center py-4 text-slate-400 text-sm">
                Recognition data will appear as recognitions are given.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-purple-500" />
            Gamification
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
              <p className="text-xl font-bold text-purple-600">0</p>
              <p className="text-xs text-silver-mist">Badges Awarded</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
              <p className="text-xl font-bold text-indigo-600">0</p>
              <p className="text-xs text-silver-mist">Challenges Done</p>
            </div>
          </div>
          <div className="text-center py-8 text-slate-400 text-sm">
            Gamification metrics will appear as the program is activated.
          </div>
        </div>

        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-500" />
            Wellness
          </h2>
          <div className="flex items-center justify-center mb-4">
            <ProgressRing value={0} size={100} color="#10B981" />
          </div>
          <p className="text-center text-sm text-silver-mist mb-4">Average Wellness Score</p>
          <div className="text-center py-4 text-slate-400 text-sm">
            Wellness data will appear as wellness programs are launched.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            Diversity & Inclusion
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="text-center">
              <ProgressRing value={0} size={80} color="#3B82F6" />
              <p className="text-sm text-silver-mist mt-2">Diversity Score</p>
            </div>
            <div className="text-center">
              <ProgressRing value={0} size={80} color="#8B5CF6" />
              <p className="text-sm text-silver-mist mt-2">Inclusion Score</p>
            </div>
          </div>
          <div className="text-center py-4 text-slate-400 text-sm">
            DEI metrics will appear as data is collected.
          </div>
        </div>

        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Engagement Trend
          </h2>
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            Engagement trend data will build over time as activities are recorded.
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-rose-500 to-purple-600 p-6 rounded-xl text-white">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-2">AI-Generated Engagement Insights</h2>
            <ul className="space-y-2 text-sm text-white/90">
              {recognitionsGiven > 0 ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-300">-</span>
                    {recognitionsGiven} recognition(s) recorded with {totalRecognitionPoints} total points awarded
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-300">-</span>
                    Survey participation rate at {surveyParticipationRate}%
                  </li>
                </>
              ) : (
                <li className="flex items-start gap-2">
                  <span className="text-amber-300">-</span>
                  Start giving recognitions and launching surveys to generate actionable insights.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

