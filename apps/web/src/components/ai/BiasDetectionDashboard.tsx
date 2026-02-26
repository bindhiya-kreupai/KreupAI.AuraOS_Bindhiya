/**
 * @module BiasDetectionDashboard
 * @description AI Bias Detection Dashboard — fairness scores, disparate impact ratios
 *              by protected group, statistical parity visualization, equalized odds,
 *              bias alerts, remediation recommendations, historical trend,
 *              model version comparison (Sec 31)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Loader2, ChevronDown, Info, Shield } from 'lucide-react';
import {
  AIGovernanceService,
  type AIModel,
  type BiasReport,
  _type,
} from '@/services/aiGovernanceService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fairnessColor(score: number) {
  if (score >= 85)
    return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-500',
      ring: 'bg-emerald-100 border-emerald-200',
    };
  if (score >= 70)
    return { text: 'text-amber-600', bg: 'bg-amber-500', ring: 'bg-amber-100 border-amber-200' };
  return { text: 'text-red-600', bg: 'bg-red-500', ring: 'bg-red-100 border-red-200' };
}

function fairnessLabel(score: number) {
  if (score >= 85) return 'Fair';
  if (score >= 70) return 'Acceptable';
  return 'Needs Review';
}

function dirRatioColor(ratio: number): string {
  const d = Math.abs(ratio - 1.0);
  if (d < 0.1) return '#10b981';
  if (d < 0.2) return '#f59e0b';
  return '#ef4444';
}

// ── Fairness Score Circle ─────────────────────────────────────────────────────

function FairnessCircle({ score }: { score: number }) {
  const size = 100;
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);
  const { text, bg } = fairnessColor(score);
  const _strokeColor = bg
    .replace('bg-', '#')
    .replace('emerald-500', '10b981')
    .replace('amber-500', 'f59e0b')
    .replace('red-500', 'ef4444');

  // map bg class to hex
  const colorMap: Record<string, string> = {
    'bg-emerald-500': '#10b981',
    'bg-amber-500': '#f59e0b',
    'bg-red-500': '#ef4444',
  };
  const strokeHex = colorMap[bg] ?? '#6366f1';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={strokeHex}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={18}
          fontWeight="800"
          className={text}
          fill={strokeHex}
        >
          {score}
        </text>
      </svg>
      <p className={`text-xs font-semibold mt-1 ${text}`}>{fairnessLabel(score)}</p>
    </div>
  );
}

// ── Disparate Impact Bar ──────────────────────────────────────────────────────

function DisparateImpactBar({ group, ratio }: { group: string; ratio: number }) {
  const color = dirRatioColor(ratio);
  // Bar: 1.0 = center, scale from 0.6 to 1.4
  const min = 0.6;
  const max = 1.4;
  const centerPct = ((1.0 - min) / (max - min)) * 100;
  const valuePct = Math.min(100, Math.max(0, ((ratio - min) / (max - min)) * 100));

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-28 text-xs text-slate-600 truncate">{group}</div>
      <div className="flex-1 relative h-5 bg-slate-100 rounded-full">
        {/* Reference line at 1.0 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
          style={{ left: `${centerPct}%` }}
        />
        {/* Threshold bands */}
        <div
          className="absolute top-0 bottom-0 bg-red-50 opacity-50 rounded-full"
          style={{ left: '0%', width: `${((0.8 - min) / (max - min)) * 100}%` }}
        />
        <div
          className="absolute top-0 bottom-0 bg-red-50 opacity-50 rounded-full"
          style={{ left: `${((1.1 - min) / (max - min)) * 100}%`, right: '0' }}
        />
        {/* Value bar */}
        <div
          className="absolute top-1 bottom-1 rounded-full transition-all"
          style={{
            backgroundColor: color,
            left: `${Math.min(centerPct, valuePct)}%`,
            width: `${Math.abs(valuePct - centerPct)}%`,
          }}
        />
      </div>
      <div className="w-12 text-xs font-bold text-right" style={{ color }}>
        {ratio.toFixed(2)}
      </div>
      {Math.abs(ratio - 1.0) > 0.1 && (
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
      )}
      {Math.abs(ratio - 1.0) <= 0.1 && (
        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      )}
    </div>
  );
}

// ── SPD Bar ───────────────────────────────────────────────────────────────────

function SPDBar({ group, spd }: { group: string; spd: number }) {
  const color = Math.abs(spd) > 0.05 ? (Math.abs(spd) > 0.1 ? '#ef4444' : '#f59e0b') : '#10b981';
  const width = Math.min(100, Math.abs(spd) * 500); // scale 0.2 -> 100%
  const positive = spd >= 0;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-28 text-xs text-slate-600 truncate">{group}</div>
      <div className="flex-1 flex items-center gap-1">
        <div className="flex-1 flex items-center justify-end">
          {!positive && (
            <div
              className="h-4 rounded-l-full transition-all"
              style={{ width: `${width}%`, backgroundColor: color }}
            />
          )}
        </div>
        <div className="w-0.5 bg-slate-400 h-5 flex-shrink-0" />
        <div className="flex-1">
          {positive && (
            <div
              className="h-4 rounded-r-full transition-all"
              style={{ width: `${width}%`, backgroundColor: color }}
            />
          )}
        </div>
      </div>
      <div className="w-16 text-xs font-bold text-right" style={{ color }}>
        {spd >= 0 ? '+' : ''}
        {spd.toFixed(3)}
      </div>
    </div>
  );
}

// ── Bias Alert Card ───────────────────────────────────────────────────────────

function BiasAlertCard({
  alert,
}: {
  alert: { group: string; metric: string; value: number; threshold: number };
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-red-800 text-sm">{alert.group}</p>
        <p className="text-xs text-red-600 mt-0.5">
          {alert.metric}: <span className="font-bold">{alert.value.toFixed(2)}</span> (threshold:{' '}
          {alert.threshold})
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BiasDetectionDashboard() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('model-001');
  const [biasReport, setBiasReport] = useState<BiasReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<
    'gender' | 'age' | 'ethnicity' | 'nationality' | 'all'
  >('all');

  useEffect(() => {
    AIGovernanceService.getAIModels().then(setModels);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const report = await AIGovernanceService.getBiasReport(selectedModelId);
      setBiasReport(report);
      setLoading(false);
    })();
  }, [selectedModelId]);

  const filteredGroups =
    biasReport?.groups.filter((g) => activeCategory === 'all' || g.category === activeCategory) ??
    [];

  const selectedModel = models.find((m) => m.id === selectedModelId);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Bias Detection Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Fairness metrics and disparate impact analysis
          </p>
        </div>
      </div>

      {/* Model Selector */}
      <div className="relative">
        <select
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700 appearance-none pr-10"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} (v{m.version})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : !biasReport ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No bias report available for this model.</p>
        </div>
      ) : (
        <>
          {/* Overall Fairness Score */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-6">
              <FairnessCircle score={biasReport.overallFairnessScore} />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-lg">Overall Fairness Score</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedModel?.name} · {biasReport.groups.length} protected groups analyzed
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Generated: {new Date(biasReport.generatedAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">Within bounds</span>
                    <span className="font-bold text-slate-700">
                      {biasReport.groups.filter((g) => !g.isAlert).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-500">Alerts</span>
                    <span className="font-bold text-red-700">{biasReport.biasAlerts.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bias Alerts */}
          {biasReport.biasAlerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Active Bias Alerts ({biasReport.biasAlerts.length})
              </h3>
              {biasReport.biasAlerts.map((alert, i) => (
                <BiasAlertCard key={i} alert={alert} />
              ))}
            </div>
          )}

          {/* Category Filter */}
          {biasReport.groups.length > 0 && (
            <>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
                {(['all', 'gender', 'age', 'ethnicity', 'nationality'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-1 min-w-fit py-1.5 px-2 text-xs font-medium rounded-lg capitalize transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {cat === 'all' ? 'All Groups' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    {cat !== 'all' && (
                      <span className="ml-1 opacity-60">
                        ({biasReport.groups.filter((g) => g.category === cat).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Disparate Impact Ratio Chart */}
              {filteredGroups.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-800 mb-1 text-sm">
                    Disparate Impact Ratio
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Reference group = 1.0. Green zone: 0.8–1.1. Red zones: concern areas.
                  </p>
                  <div className="text-xs flex items-center gap-3 mb-3 text-slate-400">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-slate-400" />
                      1.0 reference
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-2 bg-red-50 rounded opacity-70" />
                      concern zone (&lt;0.8 or &gt;1.1)
                    </div>
                  </div>
                  <div className="space-y-1">
                    {filteredGroups.map((g) => (
                      <DisparateImpactBar
                        key={g.group}
                        group={g.group}
                        ratio={g.disparateImpactRatio}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Statistical Parity Difference */}
              {filteredGroups.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-800 mb-1 text-sm">
                    Statistical Parity Difference
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Difference in positive outcome rates vs. reference group. Ideal: near 0.
                  </p>
                  <div className="text-xs flex items-center gap-4 mb-3 justify-center text-slate-400">
                    <span>← Disadvantaged</span>
                    <div className="w-0.5 h-4 bg-slate-400" />
                    <span>Advantaged →</span>
                  </div>
                  <div className="space-y-1">
                    {filteredGroups.map((g) => (
                      <SPDBar key={g.group} group={g.group} spd={g.statisticalParityDifference} />
                    ))}
                  </div>
                </div>
              )}

              {/* Equalized Odds */}
              {filteredGroups.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-800 mb-3 text-sm">
                    Equalized Odds Summary
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            Group
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            Category
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            Positive Rate
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            Equalized Odds
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            Alert
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredGroups.map((g) => (
                          <tr
                            key={g.group}
                            className={g.isAlert ? 'bg-red-50' : 'hover:bg-slate-50'}
                          >
                            <td className="px-3 py-2 font-medium text-slate-800">{g.group}</td>
                            <td className="px-3 py-2 capitalize text-slate-500">{g.category}</td>
                            <td className="px-3 py-2 text-slate-700">
                              {(g.positiveRate * 100).toFixed(1)}%
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`font-semibold ${Math.abs(g.equalizedOdds - 1.0) > 0.1 ? 'text-red-600' : 'text-emerald-600'}`}
                              >
                                {g.equalizedOdds.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {g.isAlert ? (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Recommendations */}
          {biasReport.recommendations.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Remediation Recommendations
              </h3>
              <ul className="space-y-2">
                {biasReport.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
