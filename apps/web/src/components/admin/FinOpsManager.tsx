/**
 * @module FinOpsManager
 * @description FinOps cost management dashboard with 12-month trend chart,
 *              budget tracking, savings recommendations, anomaly detection,
 *              and cost report export.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  Lightbulb,
  Loader2,
  Server,
  Tag,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import cloudInfraService, {
  type CostForecast,
  type FinOpsRecommendation,
  type Region,
} from '@/services/cloudInfraService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BudgetTracking {
  department: string;
  owner: string;
  budgetUSD: number;
  actualUSD: number;
  forecastUSD: number;
  variance: number;
}

interface CostAnomaly {
  id: string;
  service: string;
  region: Region;
  date: string;
  expectedUSD: number;
  actualUSD: number;
  anomalyPct: number;
  resolved: boolean;
}

interface AllocationTag {
  key: string;
  values: string[];
  coverage: number; // % of resources tagged
  monthlyCostUSD: number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_BUDGETS: BudgetTracking[] = [
  {
    department: 'Engineering',
    owner: 'CTO',
    budgetUSD: 12000,
    actualUSD: 10840,
    forecastUSD: 11200,
    variance: -9.7,
  },
  {
    department: 'Analytics',
    owner: 'Data Team',
    budgetUSD: 3500,
    actualUSD: 3820,
    forecastUSD: 4100,
    variance: +9.1,
  },
  {
    department: 'HR Platform',
    owner: 'HR IT',
    budgetUSD: 2800,
    actualUSD: 2540,
    forecastUSD: 2680,
    variance: -9.3,
  },
  {
    department: 'Compliance',
    owner: 'Legal',
    budgetUSD: 1500,
    actualUSD: 1490,
    forecastUSD: 1500,
    variance: -0.7,
  },
  {
    department: 'DevOps/Infra',
    owner: 'Platform Eng',
    budgetUSD: 8000,
    actualUSD: 7650,
    forecastUSD: 7900,
    variance: -4.4,
  },
];

const MOCK_ANOMALIES: CostAnomaly[] = [
  {
    id: 'an-1',
    service: 'analytics-service',
    region: 'eu-west-1',
    date: new Date(Date.now() - 86_400_000 * 2).toISOString().slice(0, 10),
    expectedUSD: 480,
    actualUSD: 720,
    anomalyPct: 50.0,
    resolved: false,
  },
  {
    id: 'an-2',
    service: 'postgresql',
    region: 'us-east-1',
    date: new Date(Date.now() - 86_400_000 * 5).toISOString().slice(0, 10),
    expectedUSD: 1200,
    actualUSD: 1580,
    anomalyPct: 31.7,
    resolved: false,
  },
  {
    id: 'an-3',
    service: 'aura-web',
    region: 'me-south-1',
    date: new Date(Date.now() - 86_400_000 * 9).toISOString().slice(0, 10),
    expectedUSD: 480,
    actualUSD: 610,
    anomalyPct: 27.1,
    resolved: true,
  },
];

const MOCK_TAGS: AllocationTag[] = [
  {
    key: 'environment',
    values: ['production', 'staging', 'dev'],
    coverage: 98,
    monthlyCostUSD: 28940,
  },
  {
    key: 'team',
    values: ['engineering', 'analytics', 'hr-it'],
    coverage: 85,
    monthlyCostUSD: 24800,
  },
  {
    key: 'service',
    values: ['web', 'payroll', 'notifications'],
    coverage: 100,
    monthlyCostUSD: 28940,
  },
  {
    key: 'cost-center',
    values: ['CC-1001', 'CC-1002', 'CC-1003'],
    coverage: 72,
    monthlyCostUSD: 20800,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCost(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
}

const EFFORT_COLOR: Record<string, string> = {
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400  bg-amber-500/10  border-amber-500/20',
  high: 'text-red-400    bg-red-500/10    border-red-500/20',
};

const PRIORITY_BORDER: Record<string, string> = {
  critical: 'border-red-500/40',
  high: 'border-amber-500/40',
  medium: 'border-blue-500/40',
  low: 'border-slate-700',
};

const REC_TYPE_ICON: Record<FinOpsRecommendation['type'], React.ElementType> = {
  'right-sizing': Server,
  'reserved-instance': BookOpen,
  'spot-instance': Zap,
  'unused-resource': AlertTriangle,
  'storage-optimization': BarChart3,
};

// ── SVG Line Chart ─────────────────────────────────────────────────────────────

function TrendChart({ data }: { data: CostForecast[] }) {
  const W = 600,
    H = 200,
    PAD = 40;

  const allValues = data.flatMap(
    (d) => [d.actualUSD, d.forecastUSD, d.budgetUSD].filter(Boolean) as number[]
  );
  const minVal = Math.min(...allValues) * 0.9;
  const maxVal = Math.max(...allValues) * 1.05;

  function xPos(i: number) {
    return PAD + (i / (data.length - 1)) * (W - PAD * 2);
  }
  function yPos(v: number) {
    return H - PAD - ((v - minVal) / (maxVal - minVal)) * (H - PAD * 2);
  }

  const actualPoints = data
    .filter((d) => d.actualUSD !== null)
    .map((d, _i) => `${xPos(data.indexOf(d))},${yPos(d.actualUSD!)}`)
    .join(' ');

  const forecastPoints = data
    .filter((d) => d.forecastUSD !== null)
    .map((d, _i) => `${xPos(data.indexOf(d))},${yPos(d.forecastUSD!)}`)
    .join(' ');

  const budgetPoints = data.map((d, i) => `${xPos(i)},${yPos(d.budgetUSD)}`).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" preserveAspectRatio="none">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + t * (H - PAD * 2)}
            y2={PAD + t * (H - PAD * 2)}
            stroke="#334155"
            strokeDasharray="4,4"
            strokeWidth={1}
          />
        ))}

        {/* Budget line */}
        <polyline
          points={budgetPoints}
          fill="none"
          stroke="#6366f1"
          strokeWidth={1.5}
          strokeDasharray="6,3"
        />

        {/* Actual line */}
        {actualPoints && (
          <polyline
            points={actualPoints}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* Forecast line */}
        {forecastPoints && (
          <polyline
            points={forecastPoints}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5,3"
            strokeLinecap="round"
          />
        )}

        {/* Dots for actual */}
        {data
          .filter((d) => d.actualUSD !== null)
          .map((d) => (
            <circle
              key={d.month + 'a'}
              cx={xPos(data.indexOf(d))}
              cy={yPos(d.actualUSD!)}
              r={3}
              fill="#22c55e"
            />
          ))}

        {/* Month labels (every 3rd) */}
        {data
          .filter((_, i) => i % 3 === 0)
          .map((d) => {
            const i = data.indexOf(d);
            return (
              <text
                key={d.month}
                x={xPos(i)}
                y={H - 5}
                textAnchor="middle"
                fontSize={8}
                fill="#64748b"
              >
                {d.month.slice(0, 3)}
              </text>
            );
          })}
      </svg>

      <div className="flex items-center gap-6 mt-2 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Actual
        </span>
        <span className="flex items-center gap-1.5 text-amber-400">
          <span
            className="w-3 h-0.5 bg-amber-400 inline-block border-dashed"
            style={{ borderTop: '1px dashed' }}
          />{' '}
          Forecast
        </span>
        <span className="flex items-center gap-1.5 text-indigo-400">
          <span className="w-3 h-0.5 bg-indigo-400 inline-block" /> Budget
        </span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function FinOpsManager() {
  const [forecast, setForecast] = useState<CostForecast[]>([]);
  const [recommendations, setRecs] = useState<FinOpsRecommendation[]>([]);
  const [anomalies, setAnomalies] = useState<CostAnomaly[]>(MOCK_ANOMALIES);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissedRecs, setDismissed] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'budgets' | 'tags' | 'anomalies'>(
    'overview'
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [fc, recs, savings] = await Promise.all([
        cloudInfraService.getCostForecast(12),
        cloudInfraService.getFinOpsRecommendations(),
        cloudInfraService.getTotalPotentialSavings(),
      ]);
      setForecast(fc);
      setRecs(recs);
      setTotalSavings(savings);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-3 text-slate-400">Loading FinOps data...</span>
      </div>
    );
  }

  const activeRecs = recommendations.filter((r) => !dismissedRecs.has(r.id));
  const unresolved = anomalies.filter((a) => !a.resolved);

  function handleExport() {
    const data = {
      exportedAt: new Date().toISOString(),
      forecast,
      recommendations: activeRecs,
      budgets: MOCK_BUDGETS,
      anomalies,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-finops-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FinOps Manager</h1>
            <p className="text-xs text-slate-400">Cloud cost optimization & financial governance</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Current Month',
            value: formatCost(forecast.find((f) => f.actualUSD === null)?.budgetUSD ?? 28940),
            icon: Calendar,
            color: 'text-white',
          },
          {
            label: 'Potential Savings',
            value: formatCost(totalSavings),
            icon: TrendingDown,
            color: 'text-emerald-400',
          },
          {
            label: 'Open Anomalies',
            value: unresolved.length,
            icon: AlertTriangle,
            color: unresolved.length > 0 ? 'text-amber-400' : 'text-slate-400',
          },
          {
            label: 'Recommendations',
            value: activeRecs.length,
            icon: Lightbulb,
            color: 'text-blue-400',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 rounded-xl p-1">
        {(['overview', 'budgets', 'tags', 'anomalies'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${
              activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab}
            {tab === 'anomalies' && unresolved.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unresolved.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Cost Trend Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-white">
                  Monthly Cost Trend — Last 12 Months
                </h2>
              </div>
            </div>
            <TrendChart data={forecast} />
          </div>

          {/* Recommendations */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Savings Recommendations</h2>
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                {formatCost(activeRecs.reduce((s, r) => s + r.potentialSavingsUSD, 0))} potential
                savings
              </div>
            </div>

            <div className="space-y-3">
              {activeRecs.map((rec) => {
                const Icon = REC_TYPE_ICON[rec.type];
                return (
                  <div
                    key={rec.id}
                    className={`bg-slate-800/50 border rounded-xl p-4 ${PRIORITY_BORDER[rec.priority]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-700 rounded-lg flex-shrink-0">
                        <Icon className="w-4 h-4 text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{rec.title}</span>
                          <span className="text-sm font-bold text-emerald-400 flex-shrink-0">
                            -{formatCost(rec.potentialSavingsUSD)}/mo
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{rec.description}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded border ${EFFORT_COLOR[rec.effort]}`}
                          >
                            {rec.effort} effort
                          </span>
                          {rec.affectedService && (
                            <span className="text-xs text-slate-500">{rec.affectedService}</span>
                          )}
                          {rec.region && (
                            <span className="text-xs text-slate-500">{rec.region}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors">
                        <CheckCircle className="w-3 h-3" />
                        Apply
                      </button>
                      <button
                        onClick={() => setDismissed((prev) => new Set([...prev, rec.id]))}
                        className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg text-xs transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
              {activeRecs.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  All recommendations dismissed or applied
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Budgets tab */}
      {activeTab === 'budgets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Budget vs Actual by Department</h2>
          </div>
          <div className="space-y-4">
            {MOCK_BUDGETS.map((b) => {
              const pct = (b.actualUSD / b.budgetUSD) * 100;
              const forecastPct = (b.forecastUSD / b.budgetUSD) * 100;
              const overBudget = pct > 100;
              const barColor =
                pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-amber-400' : 'bg-blue-500';

              return (
                <div
                  key={b.department}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-white">{b.department}</span>
                      <span className="text-xs text-slate-500 ml-2">Owner: {b.owner}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`flex items-center gap-1 font-semibold ${overBudget ? 'text-red-400' : 'text-emerald-400'}`}
                      >
                        {overBudget ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        {Math.abs(b.variance).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div
                      className={`absolute left-0 h-full rounded-full ${barColor}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                    {forecastPct <= 110 && (
                      <div
                        className="absolute h-full bg-amber-400/30"
                        style={{
                          left: `${Math.min(pct, 100)}%`,
                          width: `${Math.min(forecastPct - pct, 100 - pct)}%`,
                        }}
                      />
                    )}
                    {/* Budget line */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-white/40"
                      style={{ left: '100%' }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Budget</span>
                      <div className="text-white font-medium">{formatCost(b.budgetUSD)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Actual</span>
                      <div className={`font-medium ${overBudget ? 'text-red-400' : 'text-white'}`}>
                        {formatCost(b.actualUSD)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Forecast</span>
                      <div
                        className={`font-medium ${b.forecastUSD > b.budgetUSD ? 'text-amber-400' : 'text-slate-300'}`}
                      >
                        {formatCost(b.forecastUSD)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags tab */}
      {activeTab === 'tags' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Tag className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Cost Allocation Tags</h2>
          </div>
          <div className="space-y-4">
            {MOCK_TAGS.map((tag) => (
              <div
                key={tag.key}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-slate-700 text-purple-300 px-2 py-0.5 rounded">
                      {tag.key}
                    </code>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${
                        tag.coverage >= 95
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : tag.coverage >= 80
                            ? 'bg-amber-500/10  text-amber-400  border-amber-500/20'
                            : 'bg-red-500/10    text-red-400    border-red-500/20'
                      }`}
                    >
                      {tag.coverage}% covered
                    </span>
                  </div>
                  <span className="text-xs font-medium text-white">
                    {formatCost(tag.monthlyCostUSD)}/mo
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tag.values.map((v) => (
                    <span
                      key={v}
                      className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                    >
                      {v}
                    </span>
                  ))}
                </div>
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${tag.coverage >= 95 ? 'bg-emerald-500' : tag.coverage >= 80 ? 'bg-amber-400' : 'bg-red-500'}`}
                    style={{ width: `${tag.coverage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies tab */}
      {activeTab === 'anomalies' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Cost Anomaly Detection</h2>
          </div>
          <div className="space-y-3">
            {anomalies.map((a) => (
              <div
                key={a.id}
                className={`bg-slate-800/50 rounded-xl p-4 border ${a.resolved ? 'border-slate-700/50 opacity-50' : 'border-amber-500/30'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-white">{a.service}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      {a.region} · {a.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1 text-sm font-bold ${a.anomalyPct >= 30 ? 'text-red-400' : 'text-amber-400'}`}
                    >
                      <TrendingUp className="w-3 h-3" />+{a.anomalyPct.toFixed(1)}%
                    </span>
                    {a.resolved && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Expected: </span>
                    <span className="text-white">{formatCost(a.expectedUSD)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Actual: </span>
                    <span className="text-red-400 font-medium">{formatCost(a.actualUSD)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Overage: </span>
                    <span className="text-red-400 font-medium">
                      +{formatCost(a.actualUSD - a.expectedUSD)}
                    </span>
                  </div>
                </div>
                {!a.resolved && (
                  <button
                    onClick={() =>
                      setAnomalies((prev) =>
                        prev.map((x) => (x.id === a.id ? { ...x, resolved: true } : x))
                      )
                    }
                    className="mt-3 text-xs px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors"
                  >
                    Mark as investigated
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
