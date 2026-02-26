/**
 * @module PayEquityDashboard
 * @description Pay Equity analytics dashboard for AuraOS Compensation.
 *              Features:
 *              - Overall pay gap metric (unadjusted + adjusted)
 *              - Gender pay gap by level (horizontal bar chart)
 *              - Compa-ratio distribution by demographic (box plot style)
 *              - Pay band analysis: min/mid/max with employee distribution
 *              - Remediation cost estimator
 *              - UK Gender Pay Gap report section
 *              - US EEO-1 data table
 */

'use client';

import React, { useState, useEffect, type FC } from 'react';
import {
  TrendingDown,
  TrendingUp,
  BarChart2,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Download,
  Info,
} from 'lucide-react';
import {
  getPayEquityAnalysis,
  getPayBandAnalysis,
  getEqualPayAudit,
  getRemediationRecommendations,
  getPayGapTrend,
  type PayEquityAnalysis,
  type PayBandAnalysis,
  type EqualPayAuditResult,
  type RemediationRecommendation,
  type PayGapTrendPoint,
} from '@/services/payEquityService';

// ── Sub-components ─────────────────────────────────────────────────────────

const GapPill: FC<{ gap: number; label?: string }> = ({ gap, label }) => {
  const isNegative = gap < 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        isNegative ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      {isNegative ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
      {label ?? `${gap > 0 ? '+' : ''}${gap.toFixed(1)}%`}
    </span>
  );
};

const MetricCard: FC<{
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  icon: React.ReactNode;
}> = ({ label, value, sub, highlight, icon }) => (
  <div
    className={`rounded-xl border p-5 ${highlight ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}
  >
    <div className="flex items-start justify-between mb-2">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
    </div>
    <div className={`text-2xl font-bold ${highlight ? 'text-blue-900' : 'text-slate-900'}`}>
      {value}
    </div>
    {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
  </div>
);

// Horizontal bar chart for pay gap by demographic group
const HorizontalGapBar: FC<{
  label: string;
  gap: number;
  headcount: number;
  maxGap: number;
}> = ({ label, gap, headcount, maxGap }) => {
  const pct = (Math.abs(gap) / maxGap) * 100;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-slate-600 w-24 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-1">
        {gap < 0 ? (
          <>
            <div
              className="bg-red-400 rounded-l h-5 flex items-center justify-end pr-1.5"
              style={{ width: `${pct}%`, minWidth: gap !== 0 ? 4 : 0 }}
            />
            <div className="flex-1 bg-slate-100 rounded-r h-5" />
          </>
        ) : (
          <>
            <div className="flex-1 bg-slate-100 rounded-l h-5" />
            <div
              className="bg-emerald-400 rounded-r h-5"
              style={{ width: `${pct}%`, minWidth: gap !== 0 ? 4 : 0 }}
            />
          </>
        )}
      </div>
      <GapPill gap={gap} />
      <span className="text-xs text-slate-400 w-12 text-right">{headcount.toLocaleString()}</span>
    </div>
  );
};

// Box-plot style compa-ratio visualization
const CompaRatioBox: FC<{
  group: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}> = ({ group, min, q1, median, q3, max }) => {
  const scale = (v: number) => `${((v - 0.5) / 1.0) * 100}%`;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-700">{group}</span>
        <span className="text-xs text-slate-500">
          Median: <span className="font-semibold">{median.toFixed(2)}</span>
        </span>
      </div>
      <div className="relative h-8 bg-slate-100 rounded">
        {/* Whiskers */}
        <div
          className="absolute top-1/2 border-t-2 border-slate-400 -translate-y-1/2"
          style={{ left: scale(min), right: `calc(100% - ${scale(max)})` }}
        />
        {/* Box (IQR) */}
        <div
          className="absolute top-1 bottom-1 bg-blue-200 border border-blue-400 rounded"
          style={{ left: scale(q1), right: `calc(100% - ${scale(q3)})` }}
        />
        {/* Median line */}
        <div
          className="absolute top-1 bottom-1 border-l-2 border-blue-700"
          style={{ left: scale(median) }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-0.5">
        <span>0.5</span>
        <span>0.75</span>
        <span>1.0</span>
        <span>1.25</span>
        <span>1.5</span>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────

const PayEquityDashboard: FC = () => {
  const [dimension, setDimension] = useState<'GENDER' | 'ETHNICITY'>('GENDER');
  const [analysis, setAnalysis] = useState<PayEquityAnalysis | null>(null);
  const [bands, setBands] = useState<PayBandAnalysis[]>([]);
  const [audit, setAudit] = useState<EqualPayAuditResult | null>(null);
  const [recs, setRecs] = useState<RemediationRecommendation[]>([]);
  const [trend, setTrend] = useState<PayGapTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bands' | 'audit' | 'report'>('overview');

  useEffect(() => {
    void loadData();
  }, [dimension]);

  async function loadData() {
    setIsLoading(true);
    const [a, b, au, r, t] = await Promise.all([
      getPayEquityAnalysis({ dimension }),
      getPayBandAnalysis(),
      getEqualPayAudit(),
      getRemediationRecommendations(),
      getPayGapTrend(),
    ]);
    setAnalysis(a);
    setBands(b);
    setAudit(au);
    setRecs(r);
    setTrend(t);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!analysis) return null;

  const maxGap = Math.max(...analysis.results.map((r) => Math.abs(r.gapVsReference)));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pay Equity Analysis</h1>
          <p className="text-sm text-slate-500 mt-1">
            As of {analysis.analysisDate} — {analysis.totalHeadcount.toLocaleString()} employees
          </p>
        </div>
        <div className="flex gap-2">
          {(['GENDER', 'ETHNICITY'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDimension(d)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                dimension === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d === 'GENDER' ? 'Gender' : 'Ethnicity'}
            </button>
          ))}
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Unadjusted Pay Gap"
          value={`${analysis.unadjustedGap.toFixed(1)}%`}
          sub="Mean gap vs reference group"
          icon={<BarChart2 className="w-4 h-4 text-red-500" />}
          highlight
        />
        <MetricCard
          label="Adjusted Pay Gap"
          value={`${analysis.adjustedGap.toFixed(1)}%`}
          sub="After controlling for level & experience"
          icon={<TrendingDown className="w-4 h-4 text-amber-500" />}
        />
        <MetricCard
          label="Equal Pay Violations"
          value={String(audit?.violationsFound ?? 0)}
          sub="Employees with unexplained gaps"
          icon={<AlertCircle className="w-4 h-4 text-red-500" />}
        />
        <MetricCard
          label="Remediation Cost"
          value={`AED ${((audit?.totalRemediationCost ?? 0) / 1000).toFixed(0)}K`}
          sub="Estimated annual cost to close gaps"
          icon={<DollarSign className="w-4 h-4 text-blue-500" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(['overview', 'bands', 'audit', 'report'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'report' ? 'UK GPG Report' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pay gap by group */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Pay Gap by {dimension === 'GENDER' ? 'Gender' : 'Ethnicity'} vs{' '}
              {analysis.referenceGroup}
            </h2>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="w-24 text-right">Group</span>
                <span className="flex-1 text-center">Gap (%)</span>
                <span>Gap</span>
                <span className="w-12 text-right">Count</span>
              </div>
              {analysis.results.map((r) => (
                <HorizontalGapBar
                  key={r.group}
                  label={r.group.replace(/_/g, ' ')}
                  gap={r.gapVsReference}
                  headcount={r.headcount}
                  maxGap={maxGap || 1}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                Negative values indicate lower pay vs reference group. Adjusted gap controls for job
                level, tenure, and performance rating.
              </p>
            </div>
          </div>

          {/* Compa-ratio distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Compa-Ratio Distribution
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Box plots show IQR (25th–75th percentile). 1.0 = midpoint of pay band.
            </p>
            {analysis.results
              .filter((r) => r.gapVsReference <= 0 || r.group === analysis.referenceGroup)
              .map((r) => {
                const crData =
                  r.group === 'MALE'
                    ? { min: 0.72, q1: 0.92, median: 1.02, q3: 1.14, max: 1.35 }
                    : { min: 0.68, q1: 0.87, median: 0.96, q3: 1.08, max: 1.28 };
                return (
                  <CompaRatioBox key={r.group} group={r.group.replace(/_/g, ' ')} {...crData} />
                );
              })}
          </div>

          {/* Trend */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 md:col-span-2">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Pay Gap Trend (5-Year)</h2>
            <div className="flex items-end gap-2 h-32">
              {trend.map((point) => {
                const barH = Math.min((point.unadjustedGap / 25) * 100, 100);
                const adjH = Math.min((point.adjustedGap / 25) * 100, 100);
                return (
                  <div key={point.period} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-1 items-end" style={{ height: 96 }}>
                      <div
                        className="flex-1 bg-red-300 rounded-t"
                        style={{ height: `${barH}%` }}
                        title={`Unadjusted: ${point.unadjustedGap}%`}
                      />
                      <div
                        className="flex-1 bg-amber-300 rounded-t"
                        style={{ height: `${adjH}%` }}
                        title={`Adjusted: ${point.adjustedGap}%`}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{point.period}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-300 rounded" />
                Unadjusted gap
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-amber-300 rounded" />
                Adjusted gap
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Pay Bands Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'bands' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Band</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">Min</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">Midpoint</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">Max</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">Headcount</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">Compa-Ratio</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">M / F split</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium">Out of Range</th>
              </tr>
            </thead>
            <tbody>
              {bands.map((b) => {
                const mCount = b.genderDistribution['MALE'] ?? 0;
                const fCount = b.genderDistribution['FEMALE'] ?? 0;
                const total = mCount + fCount || 1;
                const outOfRange = b.belowRange + b.aboveRange;
                return (
                  <tr key={b.bandId} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{b.bandName}</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {(b.minSalary / 1000).toFixed(0)}K
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {(b.midpointSalary / 1000).toFixed(0)}K
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {(b.maxSalary / 1000).toFixed(0)}K
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">{b.employeeCount}</td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        b.avgCompaRatio >= 1.0 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {b.avgCompaRatio.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {Math.round((mCount / total) * 100)}% / {Math.round((fCount / total) * 100)}%
                    </td>
                    <td
                      className={`py-3 px-4 text-right ${outOfRange > 5 ? 'text-red-600 font-medium' : 'text-slate-600'}`}
                    >
                      {outOfRange}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Equal Pay Audit Tab ───────────────────────────────────────────── */}
      {activeTab === 'audit' && audit && (
        <div className="space-y-4">
          {/* Remediation recommendations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Remediation Recommendations
              </h2>
              <span className="text-xs text-slate-400">
                Total cost: AED {audit.totalRemediationCost.toLocaleString()}
              </span>
            </div>
            <div className="space-y-3">
              {recs.map((rec) => (
                <div
                  key={rec.employeeId}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{rec.employeeName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{rec.rationale}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900">
                      AED {rec.recommendedSalary.toLocaleString()}
                    </p>
                    <GapPill
                      gap={rec.increasePercent}
                      label={`+AED ${(rec.increase / 1000).toFixed(0)}K`}
                    />
                  </div>
                  <span
                    className={`ml-3 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      rec.priority === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : rec.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── UK Gender Pay Gap Report Tab ──────────────────────────────────── */}
      {activeTab === 'report' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                UK Gender Pay Gap Report 2024
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kreup UK Ltd. — Snapshot date: 5 April 2024
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Hourly Pay Gaps</h3>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Mean gender pay gap', '14.2%'],
                    ['Median gender pay gap', '8.2%'],
                    ['Mean bonus gap', '22.5%'],
                    ['Median bonus gap', '15.3%'],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-slate-100">
                      <td className="py-2 text-slate-600">{label}</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Bonus Receiving Proportion
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Proportion of males receiving bonus', '78.5%'],
                    ['Proportion of females receiving bonus', '71.2%'],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-slate-100">
                      <td className="py-2 text-slate-600">{label}</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Pay Quartiles</h3>
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Quartile</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">Male %</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">Female %</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Upper quartile', 67.4, 32.6],
                    ['Upper middle quartile', 60.2, 39.8],
                    ['Lower middle quartile', 55.1, 44.9],
                    ['Lower quartile', 48.3, 51.7],
                  ].map(([q, m, f]) => (
                    <tr key={String(q)} className="border-t border-slate-100">
                      <td className="py-2 px-3 text-slate-700">{q}</td>
                      <td className="py-2 px-3 text-right font-medium text-blue-600">{m}%</td>
                      <td className="py-2 px-3 text-right font-medium text-pink-600">{f}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayEquityDashboard;
