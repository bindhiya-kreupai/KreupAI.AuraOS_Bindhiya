'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Edit2,
  PieChart,
  Save,
  Wallet,
  X,
} from 'lucide-react';
import { Pie, ResponsiveContainer, Cell, PieChart as RePieChart, Tooltip, Legend } from 'recharts';
import { CostCenterService } from '../services';

const CHART_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#94a3b8',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
];

export default function CostCenterPage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [budgetEdits, setBudgetEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCostCenters();
  }, []);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const fetchCostCenters = async () => {
    try {
      setLoading(true);
      const data = await CostCenterService.getAllCostCenters();
      setCostCenters(data);
    } catch (error: any) {
      console.error('Error:', error);
      setStatus({ kind: 'error', text: error?.message || 'Failed to load cost centers.' });
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    const initial: Record<string, string> = {};
    costCenters.forEach((cc) => {
      const value = cc.budget?.totalBudget ?? cc.budget?.allocatedBudget ?? 0;
      initial[cc.costCenterId || cc.id] = String(value);
    });
    setBudgetEdits(initial);
    setShowEditModal(true);
  };

  const handleSaveBudgets = async () => {
    setSaving(true);
    setStatus(null);
    let saved = 0;
    let failed = 0;
    try {
      await Promise.all(
        costCenters.map(async (cc) => {
          const id = cc.costCenterId || cc.id;
          const newValue = Number(budgetEdits[id]);
          const oldValue = cc.budget?.totalBudget ?? cc.budget?.allocatedBudget ?? 0;
          if (!id || Number.isNaN(newValue) || newValue === oldValue) return;
          try {
            await CostCenterService.updateCostCenter(id, {
              budget: {
                ...cc.budget,
                totalBudget: newValue,
                allocatedBudget: newValue,
              },
            } as any);
            saved += 1;
          } catch (e: any) {
            console.error(`Failed to update cost center ${id}:`, e);
            failed += 1;
          }
        })
      );
      await fetchCostCenters();
      setShowEditModal(false);
      if (failed > 0) {
        setStatus({
          kind: 'error',
          text: `Saved ${saved}, failed ${failed}. Check the console for details.`,
        });
      } else if (saved === 0) {
        setStatus({ kind: 'success', text: 'No changes to save.' });
      } else {
        setStatus({ kind: 'success', text: `Updated ${saved} budget${saved === 1 ? '' : 's'}.` });
      }
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Failed to save budgets.' });
    } finally {
      setSaving(false);
    }
  };

  // Derive pie chart data from cost centers
  const chartData = useMemo(() => {
    return costCenters.map((cc, i) => ({
      name: cc.costCenterName || cc.department || 'Unknown',
      value: cc.budget?.totalBudget || cc.budget?.allocatedBudget || 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [costCenters]);

  const totalBudget = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const handleExport = () => {
    if (costCenters.length === 0) {
      setStatus({ kind: 'error', text: 'No cost centers to export.' });
      return;
    }
    const escape = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = [
      'Code',
      'Name',
      'Department',
      'Manager',
      'Allocated Budget',
      'Spent Budget',
      'Remaining Budget',
      'Utilized %',
    ];
    const rows = costCenters.map((cc) => {
      const allocated = cc.budget?.totalBudget ?? cc.budget?.allocatedBudget ?? 0;
      const spent = cc.budget?.spentBudget ?? 0;
      const remaining = cc.budget?.remainingBudget ?? Math.max(allocated - spent, 0);
      const utilized = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
      return [
        cc.costCenterCode || '',
        cc.costCenterName || '',
        cc.department || '',
        cc.managerName || '',
        allocated,
        spent,
        remaining,
        `${utilized}%`,
      ];
    });
    const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cost-centers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus({ kind: 'success', text: 'Cost center report downloaded.' });
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-500" />
            Cost Center Management
          </h1>
          <p className="text-slate-500 text-sm">
            Budget allocation and expense tracking per department.
          </p>
        </div>
        <button
          onClick={openEdit}
          disabled={costCenters.length === 0}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <Edit2 className="w-4 h-4" /> Adjust Budgets
        </button>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 shrink-0 ${
            status.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {status.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.text}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {!loading && costCenters.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Wallet className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No cost centers found</p>
          <p className="text-sm">Cost centers will appear here once records are added.</p>
        </div>
      )}

      {!loading && costCenters.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Chart */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm">
            <h3 className="font-bold text-lg mb-4">Budget Distribution</h3>
            {totalBudget > 0 ? (
              <div className="flex-1 min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={chartData}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => `$${(val / 1000).toFixed(0)}k`}
                      contentStyle={{ borderRadius: 8 }}
                    />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold animate-in fade-in zoom-in duration-500">
                    ${(totalBudget / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-xs text-slate-400">Total Budget</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                <PieChart className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm">No budget data available for chart display.</p>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Cost Center Details</h3>
              <button
                onClick={handleExport}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors text-sm font-bold flex items-center gap-1"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Cost Center Code</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Manager</th>
                    <th className="px-6 py-4 text-right">Allocated Budget</th>
                    <th className="px-6 py-4 text-right">Utilized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {costCenters.map((cc, i) => {
                    const allocated = cc.budget?.totalBudget || cc.budget?.allocatedBudget || 0;
                    const spent = cc.budget?.spentBudget || 0;
                    const utilizedPct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
                    const budgetDisplay = allocated > 0 ? `$${allocated.toLocaleString()}` : 'N/A';

                    return (
                      <tr
                        key={cc.costCenterId || i}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-slate-500">
                          {cc.costCenterCode || 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                          {cc.costCenterName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {cc.department || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {cc.managerName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">{budgetDisplay}</td>
                        <td className="px-6 py-4 text-right">
                          {allocated > 0 ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold
                                                            ${utilizedPct > 90 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}
                                                        `}
                            >
                              {utilizedPct}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Adjust Department Budgets</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {costCenters.length > 0 ? (
                costCenters.map((cc, i) => {
                  const id = cc.costCenterId || cc.id;
                  return (
                    <div key={id || i} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <div className="flex-1 font-bold">
                        {cc.costCenterName || cc.department || 'Unknown'}
                      </div>
                      <input
                        type="number"
                        value={budgetEdits[id] ?? '0'}
                        onChange={(e) => setBudgetEdits((b) => ({ ...b, [id]: e.target.value }))}
                        className="w-32 text-right p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                      />
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm text-center py-4">
                  No cost centers available to adjust.
                </p>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudgets}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
