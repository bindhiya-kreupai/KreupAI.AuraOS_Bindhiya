/**
 * @module DEIDashboard
 * @description DEI in Hiring Dashboard — pipeline diversity funnel, pay equity analysis,
 *              blind hiring config, DEI goals, inclusion index, EEO summary (Sec 20.5)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Download,
  Info,
} from 'lucide-react';
import {
  DEIHiringService,
  type DEIMetrics,
  type BlindHiringConfig,
  type PayGapAnalysis,
  type DEIGoal,
  type InclusionSurveyResults,
  type PipelineStageData,
} from '@/services/deiHiringService';

// ── Pipeline Diversity Funnel ─────────────────────────────────────────────────

function PipelineFunnel({ pipeline }: { pipeline: PipelineStageData[] }) {
  const [view, setView] = useState<'gender' | 'ethnicity'>('gender');
  const maxTotal = pipeline[0]?.total ?? 1;

  const genderColors: Record<string, string> = {
    Female: '#ec4899',
    Male: '#3b82f6',
    'Non-Binary': '#8b5cf6',
    'N/A': '#d1d5db',
    'Prefer not to say': '#d1d5db',
  };
  const ethnicColors: Record<string, string> = {
    White: '#6366f1',
    Asian: '#14b8a6',
    Hispanic: '#f59e0b',
    Black: '#ef4444',
    'Middle Eastern': '#8b5cf6',
    Other: '#9ca3af',
    Mixed: '#f97316',
    'Prefer not to say': '#d1d5db',
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {(['gender', 'ethnicity'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {pipeline.map((stage) => {
          const breakdown = view === 'gender' ? stage.genderBreakdown : stage.ethnicityBreakdown;
          const colorMap = view === 'gender' ? genderColors : ethnicColors;
          const widthPct = (stage.total / maxTotal) * 100;
          return (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{stage.stageLabel}</span>
                <span className="text-xs text-gray-400">{stage.total.toLocaleString()}</span>
              </div>
              <div
                className="h-8 bg-gray-100 rounded-lg overflow-hidden flex"
                style={{ width: `${Math.max(widthPct, 10)}%` }}
              >
                {breakdown.map((d) => (
                  <div
                    key={d.category}
                    className="h-full flex items-center justify-center transition-all"
                    style={{
                      width: `${d.percentage}%`,
                      backgroundColor: colorMap[d.category] ?? '#9ca3af',
                    }}
                    title={`${d.category}: ${d.percentage.toFixed(0)}% (${d.count})`}
                  >
                    {d.percentage > 10 && (
                      <span className="text-white text-xs font-bold">
                        {d.percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3">
        {(view === 'gender'
          ? [
              { l: 'Female', c: '#ec4899' },
              { l: 'Male', c: '#3b82f6' },
              { l: 'Non-Binary', c: '#8b5cf6' },
            ]
          : [
              { l: 'White', c: '#6366f1' },
              { l: 'Asian', c: '#14b8a6' },
              { l: 'Hispanic', c: '#f59e0b' },
              { l: 'Black', c: '#ef4444' },
              { l: 'Other', c: '#9ca3af' },
            ]
        ).map((item) => (
          <div key={item.l} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.c }} />
            <span className="text-xs text-gray-500">{item.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pay Gap Chart ─────────────────────────────────────────────────────────────

function PayGapChart({ analysis }: { analysis: PayGapAnalysis }) {
  const max = Math.max(...analysis.byLevel.map((l) => l.maleAvgSalary));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2 bg-blue-500 rounded" /> Male avg
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2 bg-pink-500 rounded" /> Female avg
        </div>
      </div>
      {analysis.byLevel.map((level) => (
        <div key={level.level} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-700 font-medium">{level.level}</span>
            <span
              className={`font-semibold ${level.gapPercentage > 10 ? 'text-red-600' : level.gapPercentage > 5 ? 'text-amber-600' : 'text-green-600'}`}
            >
              {level.gapPercentage.toFixed(1)}% gap
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="h-4 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded"
                style={{ width: `${(level.maleAvgSalary / max) * 100}%` }}
              >
                <span className="text-white text-xs pl-1.5 leading-4">
                  ${(level.maleAvgSalary / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
            <div className="h-4 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded"
                style={{ width: `${(level.femaleAvgSalary / max) * 100}%` }}
              >
                <span className="text-white text-xs pl-1.5 leading-4">
                  ${(level.femaleAvgSalary / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Blind Hiring Panel ─────────────────────────────────────────────────────────

function BlindHiringPanel({
  config,
  onUpdate,
}: {
  config: BlindHiringConfig;
  onUpdate: (key: keyof BlindHiringConfig, value: boolean) => void;
}) {
  const toggles: Array<{ key: keyof BlindHiringConfig; label: string; description: string }> = [
    { key: 'maskName', label: 'Candidate Name', description: 'Hide first and last name' },
    { key: 'maskPhoto', label: 'Profile Photo', description: 'Remove photos from resume view' },
    {
      key: 'maskUniversity',
      label: 'University Name',
      description: 'Hide educational institution name',
    },
    {
      key: 'maskGraduationYear',
      label: 'Graduation Year',
      description: 'Hide graduation year to avoid age bias',
    },
    { key: 'maskAddress', label: 'Address / Location', description: 'Hide home location details' },
    {
      key: 'maskGender',
      label: 'Gender Pronouns',
      description: 'Remove gender indicators from text',
    },
    { key: 'maskAge', label: 'Age / DOB', description: 'Hide age and date of birth' },
    {
      key: 'maskEthnicity',
      label: 'Ethnicity Indicators',
      description: 'Anonymize ethnicity-related text',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl mb-4">
        <div>
          <p className="text-sm font-semibold text-blue-800">Blind Screening</p>
          <p className="text-xs text-blue-600">Reduces unconscious bias during initial screening</p>
        </div>
        <button
          onClick={() => onUpdate('enabled', !config.enabled)}
          className={`w-12 h-6 rounded-full transition-all relative ${config.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${config.enabled ? 'left-6' : 'left-0.5'}`}
          />
        </button>
      </div>
      {config.enabled && (
        <div className="space-y-2">
          {toggles.map((toggle) => (
            <div
              key={toggle.key}
              className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{toggle.label}</p>
                <p className="text-xs text-gray-400">{toggle.description}</p>
              </div>
              <button
                onClick={() => onUpdate(toggle.key, !(config[toggle.key] as boolean))}
                className={`w-10 h-5 rounded-full transition-all relative ${config[toggle.key] ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${config[toggle.key] ? 'left-5' : 'left-0.5'}`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DEI Goals ─────────────────────────────────────────────────────────────────

function GoalStatusBadge({ status }: { status: DEIGoal['status'] }) {
  const cfg = {
    on_track: {
      cls: 'bg-green-100 text-green-700',
      icon: <CheckCircle size={11} />,
      label: 'On Track',
    },
    at_risk: {
      cls: 'bg-yellow-100 text-yellow-700',
      icon: <AlertCircle size={11} />,
      label: 'At Risk',
    },
    off_track: { cls: 'bg-red-100 text-red-700', icon: <XCircle size={11} />, label: 'Off Track' },
    achieved: {
      cls: 'bg-indigo-100 text-indigo-700',
      icon: <CheckCircle size={11} />,
      label: 'Achieved',
    },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── Inclusion Score Gauge ─────────────────────────────────────────────────────

function InclusionGauge({ score, trend }: { score: number; trend: number }) {
  const angle = (score / 100) * 180 - 90;
  const r = 60;
  const cx = 80;
  const cy = 75;

  const arc = (deg: number, r2: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r2 * Math.cos(rad), y: cy + r2 * Math.sin(rad) };
  };
  const startPt = arc(-180, r);
  const scorePt = arc(angle - 90, r);

  const getColor = (s: number) => (s >= 75 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444');

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 160 90" className="w-48">
        <path
          d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 0 1 ${arc(0, r).x} ${arc(0, r).y}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${score > 50 ? 1 : 0} 1 ${scorePt.x} ${scorePt.y}`}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={14}
          strokeLinecap="round"
        />
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize={22} fontWeight={700} fill="#111827">
          {score}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="#6b7280">
          /100
        </text>
      </svg>
      <div
        className={`flex items-center gap-1 text-sm font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}
      >
        {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {trend >= 0 ? '+' : ''}
        {trend.toFixed(1)} vs last quarter
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabType = 'pipeline' | 'payequity' | 'blindhiring' | 'goals' | 'inclusion';

export default function DEIDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('pipeline');
  const [metrics, setMetrics] = useState<DEIMetrics | null>(null);
  const [blindConfig, setBlindConfig] = useState<BlindHiringConfig | null>(null);
  const [payGap, setPayGap] = useState<PayGapAnalysis | null>(null);
  const [goals, setGoals] = useState<DEIGoal[]>([]);
  const [inclusion, setInclusion] = useState<InclusionSurveyResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [m, bc, pg, g, inc] = await Promise.all([
        DEIHiringService.getDEIMetrics(),
        DEIHiringService.getBlindHiringConfig(),
        DEIHiringService.getGenderPayGapAnalysis(),
        DEIHiringService.getDEIGoals(),
        DEIHiringService.getInclusionSurveyResults(),
      ]);
      setMetrics(m);
      setBlindConfig(bc);
      setPayGap(pg);
      setGoals(g);
      setInclusion(inc);
      setLoading(false);
    };
    load();
  }, []);

  const handleBlindUpdate = async (key: keyof BlindHiringConfig, value: boolean) => {
    if (!blindConfig) return;
    const updated = await DEIHiringService.updateBlindHiringConfig({ [key]: value });
    setBlindConfig(updated);
  };

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'pipeline', label: 'Pipeline Diversity', icon: <Users size={14} /> },
    { id: 'payequity', label: 'Pay Equity', icon: <BarChart3 size={14} /> },
    { id: 'blindhiring', label: 'Blind Hiring', icon: <Shield size={14} /> },
    { id: 'goals', label: 'DEI Goals', icon: <Target size={14} /> },
    { id: 'inclusion', label: 'Inclusion Index', icon: <TrendingUp size={14} /> },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DEI Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Diversity, Equity & Inclusion in Hiring — {metrics?.period}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download size={14} />
            EEO-1 Report
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Female Applicant Rate',
              value: `${metrics.femaleApplicantRate.toFixed(0)}%`,
              target: '40%',
              color: 'text-pink-600',
              bg: 'bg-pink-50',
              icon: <Users size={18} className="text-pink-600" />,
            },
            {
              label: 'URM Representation',
              value: `${metrics.urm_rate.toFixed(0)}%`,
              target: '35%',
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
              icon: <Users size={18} className="text-indigo-600" />,
            },
            {
              label: 'Inclusion Score',
              value: `${metrics.inclusionScore}/100`,
              target: '75',
              color: 'text-green-600',
              bg: 'bg-green-50',
              icon: <TrendingUp size={18} className="text-green-600" />,
            },
            {
              label: 'International Rate',
              value: `${metrics.internationalRate.toFixed(0)}%`,
              target: '30%',
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              icon: <Target size={18} className="text-blue-600" />,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3"
            >
              <div className={`p-2.5 rounded-lg ${kpi.bg}`}>{kpi.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-gray-400">Target: {kpi.target}</p>
              </div>
            </div>
          ))}
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
          {/* Pipeline Diversity */}
          {activeTab === 'pipeline' && metrics && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Diversity breakdown across each stage of the hiring funnel ({metrics.period})
              </p>
              <PipelineFunnel pipeline={metrics.pipeline} />
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Female candidate drop-off from Screening (36%) to Interview (34%) is below target.
                  Review screening criteria for potential bias.
                </p>
              </div>
            </div>
          )}

          {/* Pay Equity */}
          {activeTab === 'payequity' && payGap && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-3xl font-bold text-red-600">{payGap.overallGap.toFixed(1)}%</p>
                  <p className="text-xs text-red-700 font-medium mt-1">Unadjusted Gap</p>
                  <p className="text-xs text-gray-400">Raw salary difference</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-3xl font-bold text-amber-600">
                    {payGap.adjustedGap.toFixed(1)}%
                  </p>
                  <p className="text-xs text-amber-700 font-medium mt-1">Adjusted Gap</p>
                  <p className="text-xs text-gray-400">Same role, experience</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-gray-600">
                    {payGap.benchmarkGap.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-700 font-medium mt-1">Industry Average</p>
                  <p className="text-xs text-gray-400">Technology sector</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Pay Gap by Level ({payGap.currency})
                </h4>
                <PayGapChart analysis={payGap} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">By Department</h4>
                <div className="space-y-2">
                  {payGap.byDepartment.map((dept) => (
                    <div key={dept.department} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-28">{dept.department}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                        <div
                          className={`h-full rounded transition-all ${dept.gapPercentage > 12 ? 'bg-red-400' : dept.gapPercentage > 8 ? 'bg-amber-400' : 'bg-green-400'}`}
                          style={{ width: `${(dept.gapPercentage / 20) * 100}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-semibold w-12 text-right ${dept.gapPercentage > 12 ? 'text-red-600' : dept.gapPercentage > 8 ? 'text-amber-600' : 'text-green-600'}`}
                      >
                        {dept.gapPercentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Blind Hiring */}
          {activeTab === 'blindhiring' && blindConfig && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Configure which candidate attributes are hidden from recruiters during initial
                screening to reduce unconscious bias.
              </p>
              <BlindHiringPanel config={blindConfig} onUpdate={handleBlindUpdate} />
              <p className="text-xs text-gray-400 mt-4">
                Last updated by {blindConfig.lastUpdatedBy} on{' '}
                {new Date(blindConfig.lastUpdatedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* DEI Goals */}
          {activeTab === 'goals' && (
            <div className="space-y-3">
              {goals.map((goal) => {
                const pct = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={goal.id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{goal.metric}</p>
                        <p className="text-xs text-gray-400">
                          {goal.department} · Due {goal.targetDate} · {goal.owner}
                        </p>
                      </div>
                      <GoalStatusBadge status={goal.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">
                        Current:{' '}
                        <span className="font-bold text-gray-800">{goal.current.toFixed(0)}%</span>
                      </span>
                      <span className="text-gray-500">
                        Target: <span className="font-bold text-blue-600">{goal.target}%</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {pct.toFixed(0)}% of target achieved
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Inclusion Index */}
          {activeTab === 'inclusion' && inclusion && metrics && (
            <div className="space-y-5">
              <div className="flex items-start gap-8">
                <InclusionGauge
                  score={metrics.inclusionScore}
                  trend={metrics.inclusionScoreTrend}
                />
                <div className="flex-1 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Dimension Scores</h4>
                  {inclusion.dimensions.map((d) => (
                    <div key={d.dimension} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-36 flex-shrink-0">
                        {d.dimension}
                      </span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-800 w-6">{d.score}</span>
                      <span
                        className={`text-xs ${d.trend > 0 ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {d.trend > 0 ? '+' : ''}
                        {d.trend}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Key Insights</h4>
                  <ul className="space-y-1.5">
                    {inclusion.keyInsights.map((insight, i) => (
                      <li key={i} className="text-xs text-blue-700 flex items-start gap-1.5">
                        <CheckCircle size={11} className="flex-shrink-0 mt-0.5" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">Action Items</h4>
                  <ul className="space-y-1.5">
                    {inclusion.actionItems.map((item, i) => (
                      <li key={i} className="text-xs text-green-700 flex items-start gap-1.5">
                        <Target size={11} className="flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Scores by Demographic</h4>
                <div className="space-y-2">
                  {inclusion.byDemographic.map((d) => (
                    <div key={d.group} className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600 w-40">{d.group}</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${d.score}%`,
                            background: d.gapFromAverage < -3 ? '#f59e0b' : '#3b82f6',
                          }}
                        />
                      </div>
                      <span className="font-bold text-gray-800 w-8 text-right">{d.score}</span>
                      <span
                        className={`text-xs w-12 text-right ${d.gapFromAverage >= 0 ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {d.gapFromAverage >= 0 ? '+' : ''}
                        {d.gapFromAverage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2 text-xs text-gray-500">
                <Info size={13} />
                Survey response rate: {inclusion.responseRate}% ({inclusion.totalRespondents}{' '}
                respondents)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
