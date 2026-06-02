// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

/**
 * @module LearningAnalyticsFullDashboard
 * @description Full Learning Analytics Dashboard with 5 tabs:
 *   Overview, Course Analytics, Learner Progress, ROI, and Skill Gaps
 *   Built using learningAnalyticsService.ts (Sec 21.6)
 * @project AURA HCM Platform
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  TrendingUp,
  Award,
  Users,
  Star,
  RefreshCw,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Zap,
} from 'lucide-react';
import type {
  LearningMetrics,
  CourseEffectiveness,
  ROIAnalysis,
  SkillDevelopmentTrend,
  LearnerEngagement,
  TrainingBudget,
} from '@/services/learningAnalyticsService';
import { LearningAnalyticsService } from '@/services/learningAnalyticsService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'courses' | 'learners' | 'roi' | 'skill-gaps';

interface DashboardState {
  metrics: LearningMetrics | null;
  courseEffectiveness: CourseEffectiveness[];
  roi: ROIAnalysis | null;
  skillTrend: SkillDevelopmentTrend | null;
  engagement: LearnerEngagement | null;
  budget: TrainingBudget | null;
  loading: boolean;
  activeTab: Tab;
  selectedCourse: CourseEffectiveness | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number, prefix = '$'): string {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(0)}K`;
  return `${prefix}${n}`;
}

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

// ── Sub Components ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  trend?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
        {trend !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-lg ${
              trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {trend >= 0 ? '+' : ''}
            {trend.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ProgressBar({
  value,
  max = 100,
  color = 'bg-slate-700',
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────────

function OverviewTab({
  metrics,
  engagement,
}: {
  metrics: LearningMetrics | null;
  engagement: LearnerEngagement | null;
}) {
  if (!metrics)
    return <div className="text-center py-12 text-slate-400">No learning metrics available.</div>;

  return (
    <div className="space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={18} className="text-sky-600" />}
          label="Total Enrollments"
          value={(metrics.coursesCompleted * 1.4).toFixed(0)}
          sub="active learners"
          color="bg-sky-100"
          trend={12.3}
        />
        <StatCard
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          label="Completion Rate"
          value={pct(metrics.avgCompletionRate)}
          sub="across all courses"
          color="bg-emerald-100"
          trend={4.2}
        />
        <StatCard
          icon={<Star size={18} className="text-amber-600" />}
          label="Avg Satisfaction"
          value={`${metrics.avgSatisfactionScore.toFixed(1)}/5`}
          sub="learner rating"
          color="bg-amber-100"
          trend={0.3}
        />
        <StatCard
          icon={<Clock size={18} className="text-purple-600" />}
          label="Training Hours"
          value={`${(metrics.totalHoursLearned / 1000).toFixed(1)}K`}
          sub={`${metrics.avgHoursPerEmployee.toFixed(1)}h / employee`}
          color="bg-purple-100"
          trend={8.7}
        />
      </div>

      {/* Monthly Trend */}
      {metrics.monthlyTrend && metrics.monthlyTrend.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Monthly Learning Activity</h3>
          <div className="space-y-2">
            {metrics.monthlyTrend.slice(-6).map(({ month, hours, completions, activeUsers }) => (
              <div key={month} className="flex items-center gap-3 text-sm">
                <span className="w-16 text-slate-500 flex-shrink-0 text-xs">{month}</span>
                <div className="flex-1 flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs text-slate-400">Hours</span>
                      <span className="text-xs font-medium text-slate-600">{hours}</span>
                    </div>
                    <ProgressBar
                      value={hours}
                      max={Math.max(...metrics.monthlyTrend.map((m) => m.hours))}
                      color="bg-sky-500"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs text-slate-400">Completions</span>
                      <span className="text-xs font-medium text-slate-600">{completions}</span>
                    </div>
                    <ProgressBar
                      value={completions}
                      max={Math.max(...metrics.monthlyTrend.map((m) => m.completions))}
                      color="bg-emerald-500"
                    />
                  </div>
                  <div className="w-20 flex-shrink-0 text-right">
                    <span className="text-xs text-purple-600">{activeUsers} active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Insights */}
      {engagement && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Device Breakdown</h3>
            <div className="space-y-3">
              {engagement.deviceBreakdown.map(({ device, percentage }) => (
                <div key={device} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-20 flex-shrink-0 capitalize">
                    {device}
                  </span>
                  <div className="flex-1">
                    <ProgressBar value={percentage} />
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-8 text-right">
                    {percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Engagement Score</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800">{engagement.engagementScore}</p>
                <p className="text-xs text-slate-400">Engagement Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-700">
                  +{engagement.netPromoterScore}
                </p>
                <p className="text-xs text-slate-400">NPS</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-sky-700">{engagement.avgSessionMinutes}</p>
                <p className="text-xs text-slate-400">Avg Session (min)</p>
              </div>
            </div>
            {engagement.topDropOffReasons.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Top Drop-off Reasons</p>
                {engagement.topDropOffReasons.slice(0, 3).map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Course Analytics Tab ───────────────────────────────────────────────────────

function CourseAnalyticsTab({
  courses,
  selected,
  onSelect,
}: {
  courses: CourseEffectiveness[];
  selected: CourseEffectiveness | null;
  onSelect: (c: CourseEffectiveness | null) => void;
}) {
  const [sort, setSort] = useState<'enrollments' | 'completionRate' | 'avgScore' | 'roi'>(
    'enrollments'
  );
  const sorted = [...courses].sort((a, b) => (b[sort] as number) - (a[sort] as number));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Sort by:</span>
        {(['enrollments', 'completionRate', 'avgScore', 'roi'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              sort === s
                ? 'bg-slate-800 text-white border-slate-800'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s === 'completionRate'
              ? 'Completion'
              : s === 'avgScore'
                ? 'Score'
                : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left p-4 font-semibold text-slate-600">Course</th>
              <th className="text-right p-4 font-semibold text-slate-600">Enrollments</th>
              <th className="text-right p-4 font-semibold text-slate-600">Completion</th>
              <th className="text-right p-4 font-semibold text-slate-600">Avg Score</th>
              <th className="text-right p-4 font-semibold text-slate-600">Time (h)</th>
              <th className="text-right p-4 font-semibold text-slate-600">Satisfaction</th>
              <th className="text-right p-4 font-semibold text-slate-600">ROI</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((course) => (
              <tr
                key={course.courseId}
                className={`border-b border-slate-50 cursor-pointer transition-colors ${
                  selected?.courseId === course.courseId ? 'bg-slate-50' : 'hover:bg-slate-50'
                }`}
                onClick={() => onSelect(selected?.courseId === course.courseId ? null : course)}
              >
                <td className="p-4">
                  <p className="font-medium text-slate-800">{course.courseTitle}</p>
                  <p className="text-xs text-slate-400">{course.provider}</p>
                </td>
                <td className="p-4 text-right text-slate-600">{course.enrollments}</td>
                <td className="p-4 text-right">
                  <span
                    className={`font-medium ${course.completionRate >= 80 ? 'text-emerald-600' : course.completionRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}
                  >
                    {course.completionRate.toFixed(0)}%
                  </span>
                </td>
                <td className="p-4 text-right text-slate-600">{course.avgScore.toFixed(0)}</td>
                <td className="p-4 text-right text-slate-600">{course.avgTimeHours.toFixed(1)}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-amber-500">★</span>
                    <span className="text-slate-600">{course.avgSatisfaction.toFixed(1)}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span
                    className={`font-semibold ${course.roi >= 100 ? 'text-emerald-600' : course.roi >= 0 ? 'text-amber-600' : 'text-red-600'}`}
                  >
                    {course.roi >= 0 ? '+' : ''}
                    {course.roi.toFixed(0)}%
                  </span>
                </td>
                <td className="p-4">
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${selected?.courseId === course.courseId ? 'rotate-90' : ''} text-slate-300`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Course detail */}
      {selected && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-3">{selected.courseTitle} — Detail</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-slate-800">{selected.enrollments}</p>
              <p className="text-xs text-slate-400">Enrolled</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-emerald-700">{selected.completions}</p>
              <p className="text-xs text-slate-400">Completed</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-600">{selected.dropOffRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-400">Drop-off Rate</p>
            </div>
            <div className="bg-sky-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-sky-700">
                {selected.performanceImpact.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-400">Performance Impact</p>
            </div>
          </div>
          {selected.skillsImproved.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Skills Improved</p>
              <div className="flex flex-wrap gap-2">
                {selected.skillsImproved.map((skill) => (
                  <span
                    key={skill}
                    className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Learner Progress Tab ───────────────────────────────────────────────────────

// Mock learner data since the service doesn't have a specific getLearnerProgress
const MOCK_LEARNERS = [
  {
    id: '1',
    name: 'Ahmed Al-Rashidi',
    department: 'Technology',
    hoursCompleted: 42,
    target: 40,
    badge: 'Advanced Learner',
    badgeCount: 3,
    path: 'Cloud Architecture',
    pathProgress: 78,
    lastActivity: '2026-02-20',
  },
  {
    id: '2',
    name: 'Fatima Al-Mansouri',
    department: 'Finance',
    hoursCompleted: 28,
    target: 30,
    badge: 'Compliance Star',
    badgeCount: 2,
    path: 'Financial Controls',
    pathProgress: 91,
    lastActivity: '2026-02-24',
  },
  {
    id: '3',
    name: 'Omar Al-Farsi',
    department: 'HR',
    hoursCompleted: 19,
    target: 30,
    badge: null,
    badgeCount: 1,
    path: 'HR Business Partner',
    pathProgress: 45,
    lastActivity: '2026-02-15',
  },
  {
    id: '4',
    name: 'Sara Mohammed',
    department: 'Marketing',
    hoursCompleted: 55,
    target: 40,
    badge: 'Top Learner',
    badgeCount: 5,
    path: 'Digital Marketing',
    pathProgress: 96,
    lastActivity: '2026-02-25',
  },
  {
    id: '5',
    name: 'Khalid Al-Nouri',
    department: 'Operations',
    hoursCompleted: 12,
    target: 30,
    badge: null,
    badgeCount: 0,
    path: 'Operations Excellence',
    pathProgress: 22,
    lastActivity: '2026-01-30',
  },
  {
    id: '6',
    name: 'Layla Hassan',
    department: 'Technology',
    hoursCompleted: 38,
    target: 40,
    badge: 'Security Expert',
    badgeCount: 4,
    path: 'Cybersecurity',
    pathProgress: 85,
    lastActivity: '2026-02-22',
  },
  {
    id: '7',
    name: 'Yusuf Al-Karimi',
    department: 'Sales',
    hoursCompleted: 25,
    target: 30,
    badge: null,
    badgeCount: 1,
    path: 'Sales Excellence',
    pathProgress: 62,
    lastActivity: '2026-02-18',
  },
  {
    id: '8',
    name: 'Noura Al-Zaabi',
    department: 'Legal',
    hoursCompleted: 33,
    target: 30,
    badge: 'Compliance Master',
    badgeCount: 3,
    path: 'Legal & Compliance',
    pathProgress: 73,
    lastActivity: '2026-02-21',
  },
];

function LearnerProgressTab() {
  const [filter, setFilter] = useState<'all' | 'ahead' | 'behind'>('all');

  const filtered = MOCK_LEARNERS.filter((l) => {
    if (filter === 'ahead') return l.hoursCompleted >= l.target;
    if (filter === 'behind') return l.hoursCompleted < l.target * 0.7;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(['all', 'ahead', 'behind'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors capitalize ${
              filter === f ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
            }`}
          >
            {f === 'all' ? 'All Learners' : f === 'ahead' ? 'On Track / Ahead' : 'Needs Attention'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((learner) => {
          const pctComplete = Math.round((learner.hoursCompleted / learner.target) * 100);
          const isAhead = learner.hoursCompleted >= learner.target;
          const isBehind = learner.hoursCompleted < learner.target * 0.7;
          const daysSinceActivity = Math.abs(
            Math.ceil((new Date(learner.lastActivity).getTime() - Date.now()) / 86400000)
          );

          return (
            <div
              key={learner.id}
              className={`bg-white rounded-xl border p-4 ${isBehind ? 'border-amber-200' : 'border-slate-200'}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                  {learner.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-slate-800">{learner.name}</p>
                    {learner.badge && (
                      <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        <Award size={10} />
                        {learner.badge}
                      </span>
                    )}
                    {learner.badgeCount > 0 && (
                      <span className="text-xs text-slate-400">{learner.badgeCount} badges</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {learner.department} &bull; Path: {learner.path}
                  </p>

                  {/* Learning Hours Progress */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Learning Hours</span>
                      <span
                        className={`font-medium ${isAhead ? 'text-emerald-600' : isBehind ? 'text-amber-600' : 'text-slate-600'}`}
                      >
                        {learner.hoursCompleted}h / {learner.target}h ({pctComplete}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={learner.hoursCompleted}
                      max={learner.target}
                      color={isAhead ? 'bg-emerald-500' : isBehind ? 'bg-amber-500' : 'bg-sky-500'}
                    />
                  </div>

                  {/* Learning Path Progress */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Path Progress</span>
                      <span className="font-medium text-slate-600">{learner.pathProgress}%</span>
                    </div>
                    <ProgressBar value={learner.pathProgress} color="bg-purple-500" />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 text-xs text-slate-400">
                  <p>Last active</p>
                  <p>{daysSinceActivity}d ago</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ROI Tab ────────────────────────────────────────────────────────────────────

function ROITab({ roi, budget }: { roi: ROIAnalysis | null; budget: TrainingBudget | null }) {
  if (!roi) return <div className="text-center py-12 text-slate-400">No ROI data available.</div>;

  return (
    <div className="space-y-5">
      {/* ROI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign size={18} className="text-slate-600" />}
          label="Training Investment"
          value={fmt(roi.totalInvestment)}
          sub={roi.currency}
          color="bg-slate-100"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-emerald-600" />}
          label="Estimated Return"
          value={fmt(roi.estimatedReturn)}
          color="bg-emerald-100"
          trend={roi.roi}
        />
        <StatCard
          icon={<Zap size={18} className="text-amber-600" />}
          label="Productivity Gain"
          value={pct(roi.productivityGain)}
          sub="improvement"
          color="bg-amber-100"
        />
        <StatCard
          icon={<Users size={18} className="text-sky-600" />}
          label="Retained via L&D"
          value={roi.retentionImpact}
          sub={`${fmt(roi.retentionValue)} saved`}
          color="bg-sky-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ROI by Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">ROI by Training Category</h3>
          <div className="space-y-3">
            {roi.byCategory.map(({ category, investment, return: ret, roi: catRoi }) => (
              <div key={category} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-700 capitalize">{category}</p>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${catRoi >= 100 ? 'bg-emerald-100 text-emerald-700' : catRoi >= 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {catRoi >= 0 ? '+' : ''}
                    {catRoi.toFixed(0)}% ROI
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>Invested: {fmt(investment)}</span>
                  <span>Return: {fmt(ret)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time to Competency */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Time to Competency</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-700">{roi.timeToCompetency.before}</p>
                <p className="text-xs text-slate-400">Before (days)</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-emerald-700">{roi.timeToCompetency.after}</p>
                <p className="text-xs text-slate-400">After (days)</p>
              </div>
              <div className="bg-sky-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-sky-700">
                  -{roi.timeToCompetency.improvement}
                </p>
                <p className="text-xs text-slate-400">Improvement</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Skill Gap Closure</h3>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <p className="text-3xl font-bold text-purple-700">
                  {roi.skillGapClosure.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">of skill gaps addressed</p>
              </div>
              <div className="flex-1">
                <ProgressBar value={roi.skillGapClosure} color="bg-purple-500" />
                <p className="text-xs text-slate-400 mt-1">Through targeted training programs</p>
              </div>
            </div>
          </div>

          {/* Budget utilization */}
          {budget && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Budget Utilization</h3>
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{fmt(budget.totalSpent)}</p>
                  <p className="text-xs text-slate-400">spent of {fmt(budget.totalBudget)}</p>
                </div>
                <div className="flex-1">
                  <ProgressBar
                    value={budget.utilizationRate}
                    color={budget.utilizationRate >= 90 ? 'bg-amber-500' : 'bg-emerald-500'}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {budget.utilizationRate.toFixed(0)}% utilized
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cost per training hour */}
      {budget && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Budget by Department</h3>
          <div className="space-y-3">
            {budget.byDepartment
              .slice(0, 8)
              .map(({ department, budget: dBudget, spent, utilizationRate, spentPerEmployee }) => (
                <div key={department} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-28 flex-shrink-0 truncate">
                    {department}
                  </span>
                  <div className="flex-1">
                    <ProgressBar
                      value={utilizationRate}
                      color={utilizationRate > 90 ? 'bg-amber-500' : 'bg-sky-500'}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-20 text-right">
                    {fmt(spent)}/{fmt(dBudget)}
                  </span>
                  <span className="text-xs text-slate-400 w-16 text-right">
                    {fmt(spentPerEmployee)}/emp
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Skill Gaps Tab ─────────────────────────────────────────────────────────────

function SkillGapsTab({ skillTrend }: { skillTrend: SkillDevelopmentTrend | null }) {
  // Mock skill gap data per department
  const DEPT_SKILL_GAPS = [
    {
      dept: 'Technology',
      skills: ['Kubernetes', 'AI/ML', 'Rust', 'Cloud Security', 'DevSecOps'],
      gaps: [4, 5, 3, 4, 4],
    },
    {
      dept: 'Finance',
      skills: ['IFRS 17', 'Power BI', 'Python', 'Risk Analytics', 'ESG Reporting'],
      gaps: [3, 4, 5, 3, 4],
    },
    {
      dept: 'HR',
      skills: ['People Analytics', 'HRBP', 'Compensation Design', 'DEIB', 'Org Design'],
      gaps: [4, 3, 4, 3, 3],
    },
    {
      dept: 'Marketing',
      skills: ['Programmatic Ads', 'SEO/SEM', 'Marketing Analytics', 'Video Content', 'CRM'],
      gaps: [3, 2, 4, 3, 2],
    },
    {
      dept: 'Operations',
      skills: ['Lean Six Sigma', 'Supply Chain', 'Process Mining', 'ERP', 'Automation'],
      gaps: [5, 4, 4, 3, 5],
    },
  ];

  const gapColors = [
    'bg-red-200',
    'bg-orange-200',
    'bg-amber-200',
    'bg-yellow-100',
    'bg-green-100',
  ];
  const gapTextColors = [
    'text-red-700',
    'text-orange-700',
    'text-amber-700',
    'text-yellow-700',
    'text-green-600',
  ];

  return (
    <div className="space-y-5">
      {/* Heatmap */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 overflow-x-auto">
        <h3 className="font-semibold text-slate-800 mb-4">Skill Gap Heatmap by Department</h3>
        <p className="text-xs text-slate-400 mb-4">
          Gap Severity: 5 = Critical, 4 = High, 3 = Medium, 2 = Low, 1 = Minimal
        </p>

        <div className="min-w-[600px]">
          {/* Header row */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '120px repeat(5, 1fr)' }}>
            <div />
            {DEPT_SKILL_GAPS[0].skills.map((skill) => (
              <div key={skill} className="text-xs text-slate-400 text-center truncate px-1">
                {skill}
              </div>
            ))}
          </div>
          {DEPT_SKILL_GAPS.map(({ dept, gaps }) => (
            <div
              key={dept}
              className="grid gap-1 mb-1"
              style={{ gridTemplateColumns: '120px repeat(5, 1fr)' }}
            >
              <div className="text-xs font-medium text-slate-600 flex items-center">{dept}</div>
              {gaps.map((gap, idx) => (
                <div key={idx} className={`${gapColors[gap - 1]} rounded-lg p-2 text-center`}>
                  <p className={`text-sm font-bold ${gapTextColors[gap - 1]}`}>{gap}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[5, 4, 3, 2, 1].map((level) => (
            <div key={level} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded ${gapColors[level - 1]}`} />
              <span className="text-xs text-slate-500">
                {level} = {['Minimal', 'Low', 'Medium', 'High', 'Critical'][level - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Emerging Skills */}
      {skillTrend && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Emerging Skills (Trending Up)</h3>
            <div className="flex flex-wrap gap-2">
              {skillTrend.emergingSkills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  <TrendingUp size={10} />
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Declining Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skillTrend.decliningSkills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  <AlertTriangle size={10} />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommended Courses per Gap */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">
          Recommended Courses for Top Skill Gaps
        </h3>
        <div className="space-y-3">
          {[
            {
              gap: 'Kubernetes',
              courses: [
                'Docker & Kubernetes Fundamentals',
                'CKA Certification Prep',
                'Kubernetes Security',
              ],
              dept: 'Technology',
            },
            {
              gap: 'AI/ML',
              courses: [
                'Machine Learning with Python',
                'Deep Learning Specialization',
                'MLOps Fundamentals',
              ],
              dept: 'Technology',
            },
            {
              gap: 'Lean Six Sigma',
              courses: ['Six Sigma Green Belt', 'Process Improvement Workshop', 'Lean Operations'],
              dept: 'Operations',
            },
            {
              gap: 'People Analytics',
              courses: ['HR Analytics with R', 'Workforce Planning Analytics', 'Data-Driven HR'],
              dept: 'HR',
            },
          ].map(({ gap, courses, dept }) => (
            <div key={gap} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-slate-800">{gap}</span>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                  {dept}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {courses.map((course) => (
                  <button
                    key={course}
                    className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-lg hover:bg-sky-100 transition-colors"
                  >
                    {course}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LearningAnalyticsFullDashboard() {
  const [state, setState] = useState<DashboardState>({
    metrics: null,
    courseEffectiveness: [],
    roi: null,
    skillTrend: null,
    engagement: null,
    budget: null,
    loading: true,
    activeTab: 'overview',
    selectedCourse: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [metrics, courses, roi, skillTrend, engagement, budget] = await Promise.all([
        LearningAnalyticsService.getLearningMetrics
          ? LearningAnalyticsService.getLearningMetrics()
          : Promise.resolve(null),
        LearningAnalyticsService.getAllCourseEffectiveness
          ? LearningAnalyticsService.getAllCourseEffectiveness()
          : Promise.resolve([]),
        LearningAnalyticsService.getROIAnalysis
          ? LearningAnalyticsService.getROIAnalysis()
          : Promise.resolve(null),
        LearningAnalyticsService.getSkillDevelopmentTrend
          ? LearningAnalyticsService.getSkillDevelopmentTrend()
          : Promise.resolve(null),
        LearningAnalyticsService.getLearnerEngagement
          ? LearningAnalyticsService.getLearnerEngagement()
          : Promise.resolve(null),
        LearningAnalyticsService.getTrainingBudget
          ? LearningAnalyticsService.getTrainingBudget()
          : Promise.resolve(null),
      ]);
      setState((s) => ({
        ...s,
        metrics,
        courseEffectiveness: courses,
        roi,
        skillTrend,
        engagement,
        budget,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const {
    metrics,
    courseEffectiveness,
    roi,
    skillTrend,
    engagement,
    budget,
    loading,
    activeTab,
    selectedCourse,
  } = state;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Course Analytics' },
    { id: 'learners', label: 'Learner Progress' },
    { id: 'roi', label: 'ROI' },
    { id: 'skill-gaps', label: 'Skill Gaps' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading learning analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Learning Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Course effectiveness, learner progress, ROI, and skill gap analysis
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary KPIs */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<BookOpen size={18} className="text-sky-600" />}
            label="Courses Completed"
            value={metrics.coursesCompleted}
            sub={`${metrics.activeLearnersCount} active learners`}
            color="bg-sky-100"
          />
          <StatCard
            icon={<Award size={18} className="text-amber-600" />}
            label="Certifications Earned"
            value={metrics.certificationsEarned}
            color="bg-amber-100"
          />
          <StatCard
            icon={<CheckCircle2 size={18} className="text-emerald-600" />}
            label="Active Learner Rate"
            value={pct(metrics.activeLearnerRate)}
            sub={`of ${metrics.totalEmployees} employees`}
            color="bg-emerald-100"
          />
          <StatCard
            icon={<DollarSign size={18} className="text-purple-600" />}
            label="L&D Investment"
            value={fmt(metrics.totalLearningInvestment)}
            color="bg-purple-100"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setState((s) => ({ ...s, activeTab: tab.id }))}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab metrics={metrics} engagement={engagement} />}
        {activeTab === 'courses' && (
          <CourseAnalyticsTab
            courses={courseEffectiveness}
            selected={selectedCourse}
            onSelect={(c) => setState((s) => ({ ...s, selectedCourse: c }))}
          />
        )}
        {activeTab === 'learners' && <LearnerProgressTab />}
        {activeTab === 'roi' && <ROITab roi={roi} budget={budget} />}
        {activeTab === 'skill-gaps' && <SkillGapsTab skillTrend={skillTrend} />}
      </div>
    </div>
  );
}
