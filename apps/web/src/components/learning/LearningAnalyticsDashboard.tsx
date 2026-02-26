/**
 * @module LearningAnalyticsDashboard
 * @description Learning Analytics Dashboard — KPI cards, learning hours trend,
 *              course effectiveness, budget utilization, skill radar, ROI (Sec 21.6)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  RefreshCw,
  Target,
  Star,
  Zap,
} from 'lucide-react';
import {
  LearningAnalyticsService,
  type LearningMetrics,
  type CourseEffectiveness,
  type ROIAnalysis,
  type TrainingBudget,
  type SkillDevelopmentTrend,
  type InstructorRating,
} from '@/services/learningAnalyticsService';

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────

function LearningTrendChart({ trend }: { trend: LearningMetrics['monthlyTrend'] }) {
  const hours = trend.map((t) => t.hours);
  const completions = trend.map((t) => t.completions * 5); // scale for visibility
  const labels = trend.map((t) => t.month.slice(0, 3));
  const maxH = Math.max(...hours) * 1.2;

  const W = 500;
  const H = 160;
  const padL = 45;
  const padR = 20;
  const padT = 15;
  const padB = 25;
  const cW = W - padL - padR;
  const cH = H - padT - padB;
  const n = trend.length;

  const toX = (i: number) => padL + (i / (n - 1)) * cW;
  const toY = (v: number) => padT + cH - (v / maxH) * cH;

  const hoursPath = hours.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');
  const compPath = completions
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`)
    .join(' ');

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        preserveAspectRatio="xMidYMid meet"
      >
        {gridLines.map((f) => {
          const y = padT + cH - f * cH;
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
              <text x={padL - 5} y={y + 3} textAnchor="end" fontSize={8} fill="#9ca3af">
                {Math.round(maxH * f)}
              </text>
            </g>
          );
        })}
        <path d={hoursPath} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinejoin="round" />
        <path
          d={compPath}
          fill="none"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="4,2"
          strokeLinejoin="round"
        />
        {hours.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill="#3b82f6" />
        ))}
        {trend.map(
          (t, i) =>
            i % 3 === 0 && (
              <text
                key={i}
                x={toX(i)}
                y={H - padB + 12}
                textAnchor="middle"
                fontSize={7}
                fill="#9ca3af"
              >
                {labels[i]}
              </text>
            )
        )}
      </svg>
      <div className="flex items-center gap-4 mt-1 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-blue-500" /> Learning Hours
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-green-500" /> Completions (×5)
        </div>
      </div>
    </div>
  );
}

// ── Skills Radar ──────────────────────────────────────────────────────────────

function SkillsRadar({ skills }: { skills: SkillDevelopmentTrend['topSkillsGained'] }) {
  const topSkills = skills.slice(0, 6);
  const maxCount = Math.max(...topSkills.map((s) => s.count));
  const n = topSkills.length;
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.37;

  const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const xpt = (i: number, v: number) => cx + Math.cos(angle(i)) * r * (v / maxCount);
  const ypt = (i: number, v: number) => cy + Math.sin(angle(i)) * r * (v / maxCount);

  const toPath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xpt(i, v)} ${ypt(i, v)}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[25, 50, 75, 100].map((pct) => (
          <polygon
            key={pct}
            points={Array.from({ length: n })
              .map((_, i) => `${xpt(i, (pct / 100) * maxCount)},${ypt(i, (pct / 100) * maxCount)}`)
              .join(' ')}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: n }).map((_, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={xpt(i, maxCount)}
            y2={ypt(i, maxCount)}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}
        <path
          d={toPath(topSkills.map((s) => s.count))}
          fill="#6366f130"
          stroke="#6366f1"
          strokeWidth={2}
        />
        {topSkills.map((s, i) => (
          <text
            key={i}
            x={xpt(i, maxCount * 1.2)}
            y={ypt(i, maxCount * 1.2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill="#374151"
            fontWeight={500}
          >
            {s.skill.length > 10 ? s.skill.slice(0, 8) + '…' : s.skill}
          </text>
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-1 w-full mt-2">
        {topSkills.map((s) => (
          <div key={s.skill} className="flex items-center justify-between text-xs px-2">
            <span className="text-gray-600 truncate">{s.skill}</span>
            <span
              className={`font-semibold ${s.growthRate >= 30 ? 'text-green-600' : 'text-blue-600'}`}
            >
              +{s.growthRate}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Budget Utilization Bars ───────────────────────────────────────────────────

function BudgetBars({ budget }: { budget: TrainingBudget }) {
  return (
    <div className="space-y-2">
      {budget.byDepartment.map((dept) => {
        const pct = dept.utilizationRate;
        const color =
          pct >= 90
            ? 'bg-red-500'
            : pct >= 70
              ? 'bg-blue-500'
              : pct >= 40
                ? 'bg-amber-500'
                : 'bg-gray-400';
        return (
          <div key={dept.department}>
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="text-gray-700 w-28">{dept.department}</span>
              <div className="flex items-center gap-3 text-gray-500">
                <span>
                  ${(dept.spent / 1000).toFixed(0)}K / ${(dept.budget / 1000).toFixed(0)}K
                </span>
                <span
                  className={`font-bold w-10 text-right ${pct >= 80 ? 'text-blue-600' : pct >= 40 ? 'text-amber-600' : 'text-gray-400'}`}
                >
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Course Effectiveness Table ─────────────────────────────────────────────────

function CourseEffectivenessTable({ courses }: { courses: CourseEffectiveness[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
            <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
              Enrolled
            </th>
            <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
              Completion
            </th>
            <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
              Avg Score
            </th>
            <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
              Satisfaction
            </th>
            <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
              Perf. Impact
            </th>
            <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">ROI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {courses.map((c) => (
            <tr key={c.courseId} className="hover:bg-gray-50">
              <td className="py-2.5">
                <p className="font-medium text-gray-800 text-xs">{c.courseTitle}</p>
                <p className="text-gray-400 text-xs">{c.provider}</p>
              </td>
              <td className="py-2.5 text-right text-xs text-gray-600">{c.enrollments}</td>
              <td className="py-2.5 text-right text-xs">
                <span
                  className={`font-semibold ${c.completionRate >= 80 ? 'text-green-600' : c.completionRate >= 60 ? 'text-amber-600' : 'text-red-500'}`}
                >
                  {c.completionRate.toFixed(0)}%
                </span>
              </td>
              <td className="py-2.5 text-right text-xs font-medium text-gray-700">{c.avgScore}%</td>
              <td className="py-2.5 text-right text-xs">
                <div className="flex items-center justify-end gap-0.5">
                  <Star size={9} className="text-amber-400 fill-amber-400" />
                  <span className="font-medium">{c.avgSatisfaction.toFixed(1)}</span>
                </div>
              </td>
              <td className="py-2.5 text-right text-xs font-semibold text-green-600">
                +{c.performanceImpact}%
              </td>
              <td className="py-2.5 text-right text-xs font-bold text-blue-600">{c.roi}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── ROI Summary ───────────────────────────────────────────────────────────────

function ROISummary({ roi }: { roi: ROIAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-green-50 rounded-xl">
          <p className="text-2xl font-bold text-green-700">{roi.roi.toFixed(0)}%</p>
          <p className="text-xs text-green-600 font-medium">Overall ROI</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl">
          <p className="text-2xl font-bold text-blue-700">+{roi.productivityGain.toFixed(0)}%</p>
          <p className="text-xs text-blue-600 font-medium">Productivity Gain</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-xl">
          <p className="text-2xl font-bold text-purple-700">{roi.skillGapClosure.toFixed(0)}%</p>
          <p className="text-xs text-purple-600 font-medium">Skill Gaps Closed</p>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-600 mb-2">ROI by Category</h4>
        <div className="space-y-2">
          {roi.byCategory.map((cat) => {
            const pct = Math.min((cat.roi / 500) * 100, 100);
            return (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-gray-600">{cat.category}</span>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>Invest: ${(cat.investment / 1000).toFixed(0)}K</span>
                    <span className="text-green-600 font-bold">ROI: {cat.roi.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-500">Time to Competency</p>
          <p className="font-bold text-gray-800">
            {roi.timeToCompetency.before}d → {roi.timeToCompetency.after}d
          </p>
          <p className="text-green-600">-{roi.timeToCompetency.improvement.toFixed(0)}% faster</p>
        </div>
        <div>
          <p className="text-gray-500">Retention Impact</p>
          <p className="font-bold text-gray-800">{roi.retentionImpact} employees retained</p>
          <p className="text-green-600">${(roi.retentionValue / 1000).toFixed(0)}K saved</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabType = 'overview' | 'effectiveness' | 'budget' | 'skills' | 'roi';

export default function LearningAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [effectiveness, setEffectiveness] = useState<CourseEffectiveness[]>([]);
  const [roi, setROI] = useState<ROIAnalysis | null>(null);
  const [budget, setBudget] = useState<TrainingBudget | null>(null);
  const [skillTrend, setSkillTrend] = useState<SkillDevelopmentTrend | null>(null);
  const [instructors, setInstructors] = useState<InstructorRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [m, e, r, b, s, i] = await Promise.all([
        LearningAnalyticsService.getLearningMetrics(),
        LearningAnalyticsService.getAllCourseEffectiveness(),
        LearningAnalyticsService.getROIAnalysis(),
        LearningAnalyticsService.getTrainingBudgetUtilization(),
        LearningAnalyticsService.getSkillDevelopmentTrend(),
        LearningAnalyticsService.getInstructorRatings(),
      ]);
      setMetrics(m);
      setEffectiveness(e);
      setROI(r);
      setBudget(b);
      setSkillTrend(s);
      setInstructors(i);
      setLoading(false);
    };
    load();
  }, []);

  const TABS = [
    { id: 'overview' as TabType, label: 'Overview', icon: <BarChart3 size={14} /> },
    { id: 'effectiveness' as TabType, label: 'Course Effectiveness', icon: <Target size={14} /> },
    { id: 'budget' as TabType, label: 'Budget', icon: <DollarSign size={14} /> },
    { id: 'skills' as TabType, label: 'Skill Development', icon: <TrendingUp size={14} /> },
    { id: 'roi' as TabType, label: 'ROI Analysis', icon: <Zap size={14} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Learning Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Comprehensive L&D performance insights — {metrics?.period}
        </p>
      </div>

      {/* KPIs */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Total Hours Learned"
            value={metrics.totalHoursLearned.toLocaleString()}
            sub={`${metrics.avgHoursPerEmployee.toFixed(0)}h avg/employee`}
            icon={<Clock size={18} className="text-blue-600" />}
            color="bg-blue-50"
          />
          <KPICard
            label="Courses Completed"
            value={metrics.coursesCompleted.toLocaleString()}
            sub={`${metrics.avgCompletionRate.toFixed(0)}% avg completion`}
            icon={<BookOpen size={18} className="text-green-600" />}
            color="bg-green-50"
          />
          <KPICard
            label="Certifications Earned"
            value={metrics.certificationsEarned}
            sub="this quarter"
            icon={<Award size={18} className="text-purple-600" />}
            color="bg-purple-50"
          />
          <KPICard
            label="Active Learner Rate"
            value={`${metrics.activeLearnerRate.toFixed(0)}%`}
            sub={`${metrics.activeLearnersCount}/${metrics.totalEmployees} employees`}
            icon={<Users size={18} className="text-amber-600" />}
            color="bg-amber-50"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {/* Overview Tab */}
          {activeTab === 'overview' && metrics && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Learning Hours Trend (12 months)
                </h4>
                <LearningTrendChart trend={metrics.monthlyTrend} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-700">
                    {metrics.avgSatisfactionScore.toFixed(1)}/5
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-0.5">Avg Satisfaction Score</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-700">
                    ${(metrics.totalLearningInvestment / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-green-600 font-medium mt-0.5">Learning Investment</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Instructor Performance</h4>
                <div className="space-y-2">
                  {instructors.map((inst) => (
                    <div
                      key={inst.instructorId}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                        {inst.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-800">{inst.name}</p>
                        <p className="text-xs text-gray-400">
                          {inst.topCourse} · {inst.coursesCount} course
                          {inst.coursesCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="font-bold text-gray-800">{inst.avgRating}</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        <p className="font-medium text-green-600">
                          {inst.completionRate}% complete
                        </p>
                        <p>NPS: {inst.nps}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Effectiveness Tab */}
          {activeTab === 'effectiveness' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Course performance across completion, satisfaction, and business impact metrics.
              </p>
              <CourseEffectivenessTable courses={effectiveness} />
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && budget && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-700">
                    ${(budget.totalSpent / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-0.5">Total Spent</p>
                  <p className="text-xs text-gray-400">
                    of ${(budget.totalBudget / 1000).toFixed(0)}K budget
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-700">
                    {budget.utilizationRate.toFixed(0)}%
                  </p>
                  <p className="text-sm text-green-600 font-medium mt-0.5">Utilization</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-3xl font-bold text-purple-700">
                    ${(budget.totalSpent / metrics!.totalEmployees).toFixed(0)}
                  </p>
                  <p className="text-sm text-purple-600 font-medium mt-0.5">Per Employee</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">By Department</h4>
                <BudgetBars budget={budget} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">By Category</h4>
                <div className="space-y-2">
                  {budget.byCategory.map((cat) => {
                    const pct = (cat.spent / cat.budget) * 100;
                    return (
                      <div key={cat.category} className="flex items-center gap-3 text-xs">
                        <span className="text-gray-600 w-36">{cat.category}</span>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-500 w-28 text-right">
                          ${(cat.spent / 1000).toFixed(0)}K / ${(cat.budget / 1000).toFixed(0)}K
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Skill Development Tab */}
          {activeTab === 'skills' && skillTrend && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Skills Acquired This Quarter
                  </h4>
                  <SkillsRadar skills={skillTrend.topSkillsGained} />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Emerging Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skillTrend.emergingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium"
                        >
                          ↑ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Certifications by Skill
                    </h4>
                    <div className="space-y-1">
                      {skillTrend.certificationsBySkill.map((c) => (
                        <div key={c.skill} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{c.skill}</span>
                          <div className="flex items-center gap-1">
                            <Award size={10} className="text-amber-500" />
                            <span className="font-medium text-gray-800">{c.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Top Skills by Department
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {skillTrend.skillsByDepartment.map((d) => (
                    <div key={d.department} className="p-3 bg-gray-50 rounded-lg text-xs">
                      <p className="font-semibold text-gray-700">{d.department}</p>
                      <p className="text-blue-600 font-medium mt-0.5">{d.topSkill}</p>
                      <p className="text-gray-400">{d.count} employees</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ROI Tab */}
          {activeTab === 'roi' && roi && <ROISummary roi={roi} />}
        </div>
      </div>
    </div>
  );
}
