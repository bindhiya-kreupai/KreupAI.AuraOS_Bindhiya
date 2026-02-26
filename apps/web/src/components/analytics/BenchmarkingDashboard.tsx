/**
 * @module BenchmarkingDashboard
 * @description Benchmarking Dashboard — company vs industry radar, per-metric comparison bars,
 *              compensation percentile positioning, trend comparison, improvement areas (Sec 23.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  RefreshCw,
  Info,
  Award,
} from 'lucide-react';
import {
  BenchmarkingService,
  type IndustryBenchmark,
  type BenchmarkValue,
  type CompensationBenchmark,
  type TrendComparison,
  _type,
} from '@/services/benchmarkingService';

// ── Radar Chart ───────────────────────────────────────────────────────────────

function BenchmarkRadar({ metrics }: { metrics: BenchmarkValue[] }) {
  const topMetrics = metrics.slice(0, 6);
  const n = topMetrics.length;
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;

  const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const norm = (metric: BenchmarkValue, val: number) => {
    const range = metric.industryBottomQuartile - metric.industryTopQuartile;
    if (range === 0) return 0.5;
    const normalized = metric.isPositiveWhenHigher
      ? (val - metric.industryBottomQuartile) / range
      : (metric.industryBottomQuartile - val) / range;
    return Math.max(0, Math.min(1, normalized));
  };

  const xpt = (i: number, v: number) => cx + Math.cos(angle(i)) * r * v;
  const ypt = (i: number, v: number) => cy + Math.sin(angle(i)) * r * v;

  const compPath =
    topMetrics
      .map((m, i) => {
        const v = norm(m, m.companyValue);
        return `${i === 0 ? 'M' : 'L'} ${xpt(i, v)} ${ypt(i, v)}`;
      })
      .join(' ') + ' Z';

  const benchPath =
    topMetrics
      .map((m, i) => {
        const v = norm(m, m.industryMedian);
        return `${i === 0 ? 'M' : 'L'} ${xpt(i, v)} ${ypt(i, v)}`;
      })
      .join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={Array.from({ length: n })
              .map((_, i) => `${xpt(i, f)},${ypt(i, f)}`)
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
            x2={xpt(i, 1)}
            y2={ypt(i, 1)}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}
        <path
          d={benchPath}
          fill="#94a3b820"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="4,2"
        />
        <path d={compPath} fill="#6366f125" stroke="#6366f1" strokeWidth={2} />
        {topMetrics.map((m, i) => (
          <text
            key={i}
            x={xpt(i, 1.2)}
            y={ypt(i, 1.2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill="#374151"
            fontWeight={500}
          >
            {m.label.split(' ').slice(0, 2).join(' ')}
          </text>
        ))}
      </svg>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-indigo-500" /> Company
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-slate-400" /> Industry Median
        </div>
      </div>
    </div>
  );
}

// ── Metric Comparison Bar ─────────────────────────────────────────────────────

function MetricBar({ metric }: { metric: BenchmarkValue }) {
  const min = metric.industryBottomQuartile;
  const max = metric.industryTopQuartile;
  const span = min - max; // bottom quartile is worse value (bigger) for negative metrics
  const _range = Math.abs(span) * 1.5;

  // Normalize positions on a 0-100 scale
  const pos = (val: number) => {
    if (metric.isPositiveWhenHigher) {
      const lo = metric.industryBottomQuartile;
      const hi = metric.industryTopQuartile * 1.2;
      return Math.max(0, Math.min(100, ((val - lo) / (hi - lo)) * 100));
    } else {
      const hi = metric.industryBottomQuartile * 1.1;
      const lo = metric.industryTopQuartile * 0.8;
      return Math.max(0, Math.min(100, ((hi - val) / (hi - lo)) * 100));
    }
  };

  const compPos = pos(metric.companyValue);
  const medianPos = pos(metric.industryMedian);
  const q1Pos = pos(metric.industryBottomQuartile);
  const q3Pos = pos(metric.industryTopQuartile);

  const rankColor = {
    top_quartile: 'bg-green-600 text-white',
    above_median: 'bg-blue-100 text-blue-700',
    below_median: 'bg-amber-100 text-amber-700',
    bottom_quartile: 'bg-red-100 text-red-700',
  }[metric.rank];

  const isGood =
    (metric.isPositiveWhenHigher && metric.companyValue >= metric.industryMedian) ||
    (!metric.isPositiveWhenHigher && metric.companyValue <= metric.industryMedian);

  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">{metric.label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-bold text-gray-900">
              {metric.companyValue.toLocaleString()}
              {metric.unit === '%' ? '%' : metric.unit === 'days' ? 'd' : ''}
            </span>
            <span
              className={`text-xs flex items-center gap-0.5 ${isGood ? 'text-green-600' : 'text-red-500'}`}
            >
              {isGood ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {metric.trend >= 0 ? '+' : ''}
              {metric.trend}
              {metric.unit === '%' ? 'pp' : metric.unit === 'days' ? 'd' : ''}
            </span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${rankColor}`}>
          {metric.rank
            .replace('_', ' ')
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')}
        </span>
      </div>

      {/* Comparison track */}
      <div className="relative h-6 mb-1">
        {/* IQR band */}
        <div
          className="absolute h-2 top-2 rounded bg-gray-200"
          style={{ left: `${Math.min(q1Pos, q3Pos)}%`, width: `${Math.abs(q3Pos - q1Pos)}%` }}
        />
        {/* Median line */}
        <div className="absolute w-0.5 h-4 top-1 bg-gray-600" style={{ left: `${medianPos}%` }} />
        {/* Company marker */}
        <div
          className={`absolute w-4 h-4 top-1 rounded-full border-2 border-white shadow ${isGood ? 'bg-blue-600' : 'bg-amber-500'}`}
          style={{ left: `${compPos - 2}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          Bottom Q: {metric.industryBottomQuartile.toLocaleString()}
          {metric.unit === '%' ? '%' : ''}
        </span>
        <span>
          Median: {metric.industryMedian.toLocaleString()}
          {metric.unit === '%' ? '%' : ''}
        </span>
        <span>
          Top Q: {metric.industryTopQuartile.toLocaleString()}
          {metric.unit === '%' ? '%' : ''}
        </span>
      </div>
    </div>
  );
}

// ── Compensation Percentile ───────────────────────────────────────────────────

function CompensationCard({ bench }: { bench: CompensationBenchmark }) {
  const pct = bench.companyPercentile;
  const formatVal = (v: number) => {
    if (bench.currency === 'USD') return `$${(v / 1000).toFixed(0)}K`;
    if (bench.currency === 'SAR') return `SAR ${(v / 1000).toFixed(0)}K`;
    if (bench.currency === 'INR') return `₹${(v / 100000).toFixed(1)}L`;
    return `${(v / 1000).toFixed(0)}K`;
  };

  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {bench.role} ({bench.level})
          </p>
          <p className="text-xs text-gray-400">
            {bench.location} · {bench.currency} · {bench.sampleSize.toLocaleString()} data points
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-sm font-bold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-blue-600' : 'text-amber-600'}`}
          >
            {pct}th percentile
          </p>
          <p className="text-xs text-gray-400">+{bench.marketTrend.toFixed(1)}% YoY</p>
        </div>
      </div>

      {/* Percentile track */}
      <div className="relative h-4 mb-2">
        <div className="absolute inset-0 rounded-full overflow-hidden flex">
          <div className="h-full bg-red-100" style={{ width: '25%' }} />
          <div className="h-full bg-amber-100" style={{ width: '25%' }} />
          <div className="h-full bg-blue-100" style={{ width: '25%' }} />
          <div className="h-full bg-green-100" style={{ width: '25%' }} />
        </div>
        <div
          className={`absolute w-4 h-4 top-0 rounded-full border-2 border-white shadow-md ${pct >= 75 ? 'bg-green-600' : pct >= 50 ? 'bg-blue-600' : 'bg-amber-500'}`}
          style={{ left: `${Math.min(pct - 2, 96)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span>P25: {formatVal(bench.percentile25)}</span>
        <span>P50: {formatVal(bench.percentile50)}</span>
        <span>P75: {formatVal(bench.percentile75)}</span>
        <span>P90: {formatVal(bench.percentile90)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Our offer range:</span>
        <span className={`font-bold ${pct >= 50 ? 'text-blue-600' : 'text-amber-600'}`}>
          {formatVal(bench.companyValue)}
        </span>
      </div>
    </div>
  );
}

// ── Trend Chart ───────────────────────────────────────────────────────────────

function TrendComparisonChart({ trend }: { trend: TrendComparison }) {
  const allVals = [
    ...trend.quarters.map((q) => q.companyValue),
    ...trend.quarters.map((q) => q.industryMedian),
  ];
  const min = Math.min(...allVals) * 0.9;
  const max = Math.max(...allVals) * 1.1;
  const n = trend.quarters.length;
  const W = 300;
  const H = 80;
  const padL = 35;
  const padR = 15;
  const padT = 10;
  const padB = 20;
  const cW = W - padL - padR;
  const cH = H - padT - padB;

  const toX = (i: number) => padL + (i / (n - 1)) * cW;
  const toY = (v: number) => padT + cH - ((v - min) / (max - min)) * cH;

  const compPath = trend.quarters
    .map((q, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(q.companyValue)}`)
    .join(' ');
  const benchPath = trend.quarters
    .map((q, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(q.industryMedian)}`)
    .join(' ');

  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 mb-1">{trend.label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {[0, 0.5, 1].map((f) => {
          const y = padT + cH - f * cH;
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth={0.5} />
              <text x={padL - 3} y={y + 3} textAnchor="end" fontSize={7} fill="#9ca3af">
                {(min + f * (max - min)).toFixed(0)}
              </text>
            </g>
          );
        })}
        <path d={compPath} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />
        <path
          d={benchPath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="3,2"
          strokeLinejoin="round"
        />
        {trend.quarters.map((q, i) => (
          <text
            key={i}
            x={toX(i)}
            y={H - padB + 11}
            textAnchor="middle"
            fontSize={7}
            fill="#9ca3af"
          >
            {q.quarter.replace(' ', '\n')}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabType = 'overview' | 'metrics' | 'compensation' | 'trends';

export default function BenchmarkingDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [benchmark, setBenchmark] = useState<IndustryBenchmark | null>(null);
  const [compensationData, setCompensationData] = useState<CompensationBenchmark[]>([]);
  const [trendData, setTrendData] = useState<TrendComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('Dubai, UAE');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [b, c, t] = await Promise.all([
        BenchmarkingService.getIndustryBenchmarks(),
        BenchmarkingService.getCompensationBenchmarks(),
        BenchmarkingService.getTrendComparisons(),
      ]);
      setBenchmark(b);
      setCompensationData(c);
      setTrendData(t);
      setLoading(false);
    };
    load();
  }, []);

  const aboveMedian =
    benchmark?.metrics.filter((m) => ['top_quartile', 'above_median'].includes(m.rank)).length ?? 0;
  const belowMedian =
    benchmark?.metrics.filter((m) => ['below_median', 'bottom_quartile'].includes(m.rank)).length ??
    0;

  const improvements =
    benchmark?.metrics.filter((m) => ['below_median', 'bottom_quartile'].includes(m.rank)) ?? [];

  const TABS = [
    { id: 'overview' as TabType, label: 'Overview', icon: <BarChart3 size={14} /> },
    { id: 'metrics' as TabType, label: 'All Metrics', icon: <Target size={14} /> },
    { id: 'compensation' as TabType, label: 'Compensation', icon: <DollarSign size={14} /> },
    { id: 'trends' as TabType, label: 'Trends', icon: <TrendingUp size={14} /> },
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benchmarking Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {benchmark?.industryLabel} industry · {benchmark?.companySize} ·{' '}
            {benchmark?.reportPeriod}
            <span className="ml-2 text-xs text-gray-400">Source: {benchmark?.source}</span>
          </p>
        </div>
        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none">
          <option>Technology</option>
          <option>Healthcare</option>
          <option>Finance</option>
          <option>Manufacturing</option>
        </select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Above Median',
            value: aboveMedian,
            total: benchmark?.metrics.length,
            color: 'text-green-700',
            bg: 'bg-green-50',
            icon: <TrendingUp size={18} className="text-green-600" />,
          },
          {
            label: 'Below Median',
            value: belowMedian,
            total: benchmark?.metrics.length,
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            icon: <TrendingDown size={18} className="text-amber-600" />,
          },
          {
            label: 'Metrics Tracked',
            value: benchmark?.metrics.length,
            color: 'text-blue-700',
            bg: 'bg-blue-50',
            icon: <BarChart3 size={18} className="text-blue-600" />,
          },
          {
            label: 'Peer Companies',
            value: 280,
            color: 'text-purple-700',
            bg: 'bg-purple-50',
            icon: <Award size={18} className="text-purple-600" />,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3"
          >
            <div className={`p-2.5 rounded-lg ${kpi.bg}`}>{kpi.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>
                {kpi.value}
                {kpi.total ? `/${kpi.total}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {/* Overview */}
          {activeTab === 'overview' && benchmark && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Company vs Industry (6 Key Metrics)
                  </h4>
                  <BenchmarkRadar metrics={benchmark.metrics.slice(0, 6)} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Quick Metrics</h4>
                  {benchmark.metrics.slice(0, 5).map((m) => {
                    const isGood =
                      (m.isPositiveWhenHigher && m.companyValue >= m.industryMedian) ||
                      (!m.isPositiveWhenHigher && m.companyValue <= m.industryMedian);
                    return (
                      <div key={m.metric} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-32">{m.label}</span>
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${isGood ? 'bg-green-500' : 'bg-amber-400'}`}
                        />
                        <span className="text-xs font-bold text-gray-800">
                          {m.companyValue.toLocaleString()}
                          {m.unit === '%' ? '%' : m.unit === 'days' ? 'd' : ''}
                        </span>
                        <span className="text-xs text-gray-400">
                          vs {m.industryMedian.toLocaleString()}
                          {m.unit === '%' ? '%' : ''} median
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {improvements.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <Info size={14} /> Improvement Areas
                  </h4>
                  <ul className="space-y-1">
                    {improvements.map((m) => (
                      <li
                        key={m.metric}
                        className="text-xs text-amber-700 flex items-center gap-1.5"
                      >
                        <TrendingDown size={11} />
                        {m.label}: {m.companyValue}
                        {m.unit === '%' ? '%' : ''} (median: {m.industryMedian}
                        {m.unit === '%' ? '%' : ''})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* All Metrics */}
          {activeTab === 'metrics' && benchmark && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benchmark.metrics.map((m) => (
                <MetricBar key={m.metric} metric={m} />
              ))}
            </div>
          )}

          {/* Compensation */}
          {activeTab === 'compensation' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  placeholder="Filter by role..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none"
                >
                  <option>Dubai, UAE</option>
                  <option>Riyadh, Saudi Arabia</option>
                  <option>Bangalore, India</option>
                  <option>All Locations</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {compensationData
                  .filter(
                    (b) => !roleFilter || b.role.toLowerCase().includes(roleFilter.toLowerCase())
                  )
                  .filter(
                    (b) =>
                      locationFilter === 'All Locations' ||
                      b.location.includes(locationFilter.split(',')[0])
                  )
                  .map((bench) => (
                    <CompensationCard
                      key={`${bench.role}-${bench.level}-${bench.location}`}
                      bench={bench}
                    />
                  ))}
              </div>
              <p className="text-xs text-gray-400">
                Sources: Mercer 2026 Salary Survey, Radford Global Tech Survey, Korn Ferry, Aon
                Hewitt. Data represents total cash compensation including base salary and target
                bonus.
              </p>
            </div>
          )}

          {/* Trends */}
          {activeTab === 'trends' && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">
                Company performance improvement vs industry over the last 4 quarters.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trendData.map((trend) => (
                  <TrendComparisonChart key={trend.metric} trend={trend} />
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-indigo-500" /> Company
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 border-t-2 border-dashed border-slate-400" /> Industry
                  Median
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
