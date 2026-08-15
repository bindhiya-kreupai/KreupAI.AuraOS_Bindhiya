'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  AlertOctagon,
  TrendingDown,
  DollarSign,
  Briefcase,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  predictiveAttrition,
  type AttritionDashboardResponse,
  type AttritionEmployeeRow,
  type AttritionSimulationResponse,
} from '@/lib/services/ai-automation-client';

function formatCurrency(n: number): string {
  if (!n || n <= 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function riskBadgeClass(score: number): string {
  if (score >= 80) {
    return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  }
  if (score >= 60) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
  }
  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
}

export default function AttritionPredictionPage() {
  const [salaryBoost, setSalaryBoost] = useState(0);
  const [dashboard, setDashboard] = useState<AttritionDashboardResponse | null>(null);
  const [atRiskEmployees, setAtRiskEmployees] = useState<AttritionEmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulation, setSimulation] = useState<AttritionSimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AttritionEmployeeRow | null>(null);
  const [horizonDays, setHorizonDays] = useState<90 | 180 | 365>(180);

  const fetchAttritionData = useCallback(
    async (hz = horizonDays) => {
      setLoading(true);
      setError(null);
      try {
        // Summary may auto-recompute once; at-risk reads persisted results after
        const riskScoresResult = await predictiveAttrition.getRiskScores({ horizonDays: hz });
        const atRiskResult = await predictiveAttrition.getAtRiskEmployees({
          limit: 50,
          horizonDays: hz,
        });

        if (!riskScoresResult.success) {
          setError(riskScoresResult.error || 'Failed to load attrition summary');
          setDashboard(null);
        } else {
          setDashboard(riskScoresResult.data || null);
        }

        if (atRiskResult.success) {
          setAtRiskEmployees(atRiskResult.data?.employees || []);
        } else {
          setAtRiskEmployees([]);
          if (!riskScoresResult.success) {
            setError(atRiskResult.error || riskScoresResult.error || 'Failed to load data');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attrition data');
        setAtRiskEmployees([]);
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    },
    [horizonDays]
  );

  useEffect(() => {
    fetchAttritionData(horizonDays);
  }, [fetchAttritionData, horizonDays]);

  useEffect(() => {
    if (salaryBoost <= 0) {
      setSimulation(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSimulating(true);
      try {
        const result = await predictiveAttrition.simulate(salaryBoost, horizonDays);
        if (result.success && result.data) {
          setSimulation(result.data);
        }
      } catch {
        /* keep local estimate silent */
      } finally {
        setSimulating(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [salaryBoost, horizonDays]);

  const handleRecompute = async () => {
    setRecomputing(true);
    setError(null);
    try {
      const result = await predictiveAttrition.recompute({ horizonDays });
      if (!result.success) {
        setError(result.error || 'Recompute failed');
      }
      await fetchAttritionData(horizonDays);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recompute failed');
    } finally {
      setRecomputing(false);
    }
  };

  const summary = dashboard?.summary;
  const distribution =
    dashboard?.distribution?.map((d) => ({
      ...d,
      color:
        d.color ||
        (d.name.includes('High') ? '#ef4444' : d.name.includes('Medium') ? '#f59e0b' : '#10b981'),
    })) || [];
  const drivers = dashboard?.drivers || [];

  const predictedReduction =
    simulation?.projectedRiskReductionPct ??
    (salaryBoost > 0 ? Math.min(salaryBoost * 1.2, 40) : 0);
  const estimatedSaved = simulation?.estimatedSavedHeadcount ?? Math.round(predictedReduction / 2);

  const accuracyPct =
    summary?.modelAccuracy != null
      ? `${Math.round(summary.modelAccuracy * (summary.modelAccuracy <= 1 ? 100 : 1))}%`
      : '—';

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-indigo-500" />
            Attrition Prediction
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Explainable flight-risk scores from live workforce data. Advisory only — no automated HR
            actions.
          </p>
          {summary?.modelVersion && (
            <p className="text-xs text-silver-mist mt-1">
              Model {summary.modelVersion}
              {summary.lastRunAt
                ? ` · Last run ${new Date(summary.lastRunAt).toLocaleString()}`
                : ''}
              {dashboard?.stale ? ' · Snapshot may be stale' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={horizonDays}
            onChange={(e) => setHorizonDays(Number(e.target.value) as 90 | 180 | 365)}
            className="text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue px-3 py-2 text-ink-black dark:text-pearl"
            aria-label="Prediction horizon"
          >
            <option value={90}>90-day horizon</option>
            <option value={180}>180-day horizon</option>
            <option value={365}>365-day horizon</option>
          </select>
          <button
            type="button"
            onClick={handleRecompute}
            disabled={recomputing || loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {recomputing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh predictions
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-silver-mist gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading attrition insights…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/20">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-silver-mist font-bold uppercase">At-Risk Employees</p>
                <h3 className="text-3xl font-bold text-ink-black dark:text-pearl">
                  {summary?.atRiskCount ?? 0}
                </h3>
                <p className="text-xs text-rose-500 font-medium">
                  {summary?.atRiskPercentage ?? 0}% of workforce
                  {summary?.totalEmployees != null ? ` (${summary.totalEmployees} scored)` : ''}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-silver-mist font-bold uppercase">
                  Potential Replacement Cost
                </p>
                <h3 className="text-3xl font-bold text-ink-black dark:text-pearl">
                  {formatCurrency(summary?.replacementCostEstimate ?? 0)}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Est. recruitment + training (×0.5 annual)
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                <TrendingDown className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-silver-mist font-bold uppercase">Prediction Accuracy</p>
                <h3 className="text-3xl font-bold text-ink-black dark:text-pearl">{accuracyPct}</h3>
                <p className="text-xs text-emerald-500 font-medium">
                  {summary?.modelAccuracy != null
                    ? 'From model evaluation metadata'
                    : 'Rules model — accuracy after outcome feedback'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
              <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">
                Workforce Risk Profile
              </h2>
              {distribution.every((d) => !d.value) ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-silver-mist">
                  No predictions yet. Click Refresh predictions.
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
              <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">
                Top Drivers of Attrition
              </h2>
              {drivers.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-silver-mist">
                  Drivers appear after a prediction run.
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={drivers}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="factor"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Retention Simulator</h2>
                <p className="text-indigo-200 text-sm mb-4">
                  What-if salary adjustments (server-side). Live scores are not changed until you
                  run a separate retention workflow.
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>Salary Increase</span>
                      <span>{salaryBoost}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={salaryBoost}
                      onChange={(e) => setSalaryBoost(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-indigo-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white/10 rounded-lg p-6 backdrop-blur-sm border border-white/10">
                <div className="flex items-end gap-2 mb-2">
                  {simulating ? (
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-300" />
                  ) : (
                    <span className="text-4xl font-bold text-emerald-400">
                      -{predictedReduction.toFixed(1)}%
                    </span>
                  )}
                  <span className="text-sm font-medium text-indigo-200 mb-1">Risk Reduction</span>
                </div>
                <p className="text-xs text-indigo-200">
                  {simulation?.message ||
                    (salaryBoost > 0
                      ? `Increasing salaries by ${salaryBoost}% is predicted to save approximately ${estimatedSaved} high-risk employees from leaving this period.`
                      : 'Move the slider to project risk reduction for the at-risk cohort.')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-cloud dark:border-nebula-purple/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-ink-black dark:text-pearl">
                Urgent Attention Required
              </h2>
              <span className="text-xs text-silver-mist">
                {atRiskEmployees.length} employee{atRiskEmployees.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="overflow-x-auto">
              {atRiskEmployees.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-silver-mist">
                  No employees above the at-risk threshold. Refresh predictions after workforce data
                  is available.
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-silver-mist font-bold">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Risk Score</th>
                      <th className="px-6 py-4">Primary Factor</th>
                      <th className="px-6 py-4">AI Recommendation</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                    {atRiskEmployees.map((employee) => {
                      const topAction =
                        employee.recommendations?.[0]?.action || 'Retention check-in';
                      return (
                        <tr
                          key={employee.employeeId}
                          className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-ink-black dark:text-pearl">
                            {employee.employeeName}
                            <div className="text-xs text-silver-mist font-normal">
                              {employee.role || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                            {employee.department}
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${riskBadgeClass(employee.riskScore)}`}
                            >
                              <AlertOctagon className="w-3 h-3" />
                              {employee.riskScore}/100 · {employee.riskLevel}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                            {employee.primaryFactor}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5" />
                              {topAction}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => setSelected(employee)}
                              className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors"
                              aria-label={`View ${employee.employeeName} detail`}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-stellar-blue rounded-xl max-w-lg w-full border border-cloud dark:border-nebula-purple/50 shadow-xl p-6 space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink-black dark:text-pearl">
                  {selected.employeeName}
                </h3>
                <p className="text-sm text-silver-mist">
                  {selected.role} · {selected.department}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-sm text-silver-mist hover:text-ink-black dark:hover:text-pearl"
              >
                Close
              </button>
            </div>
            <div
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${riskBadgeClass(selected.riskScore)}`}
            >
              {selected.riskScore}/100 · {selected.riskLevel}
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-silver-mist mb-2">Top factors</p>
              <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
                {(selected.factors || []).slice(0, 5).map((f) => (
                  <li key={f.name}>
                    {f.name} <span className="text-silver-mist">(impact {f.impact})</span>
                  </li>
                ))}
                {!selected.factors?.length && <li>{selected.primaryFactor}</li>}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-silver-mist mb-2">
                Recommended actions (advisory)
              </p>
              <ul className="space-y-2 text-sm">
                {(selected.recommendations || []).map((r) => (
                  <li
                    key={r.action}
                    className="flex justify-between gap-2 text-ink-black dark:text-pearl"
                  >
                    <span>{r.action}</span>
                    <span className="text-xs text-indigo-500 shrink-0">
                      {r.priority} · −{r.estimatedImpact} pts
                    </span>
                  </li>
                ))}
                {!selected.recommendations?.length && (
                  <li className="text-silver-mist">No recommendations generated</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
