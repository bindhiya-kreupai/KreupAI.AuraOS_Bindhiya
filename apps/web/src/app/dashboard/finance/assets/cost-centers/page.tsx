'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Download,
  Loader2,
  X,
} from 'lucide-react';
import { CostCenterService, exportToCsv } from '../../services';
import type { CostCenterRecord } from '../../services';
import { ToastContainer, useToast } from '../../components/Toast';

type VarianceStatus = 'under-budget' | 'on-budget' | 'over-budget';

function statusFor(allocated: number, spent: number): VarianceStatus {
  if (allocated === 0) return 'on-budget';
  const util = (spent / allocated) * 100;
  if (util > 100) return 'over-budget';
  if (util > 90) return 'on-budget';
  return 'under-budget';
}

const statusColor: Record<VarianceStatus, string> = {
  'under-budget': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  'on-budget': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  'over-budget': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export default function CostCentersPage() {
  const [costCenters, setCostCenters] = useState<CostCenterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    fiscalYear: String(new Date().getFullYear()),
    allocatedBudget: '',
    spentBudget: '',
  });
  const { toasts, showToast, dismissToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CostCenterService.getCostCenters();
      setCostCenters(data);
    } catch {
      showToast('error', 'Failed to load cost centers.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      costCenters.filter((cc) => {
        const q = search.toLowerCase();
        return !q || cc.name.toLowerCase().includes(q) || cc.code.toLowerCase().includes(q);
      }),
    [costCenters, search]
  );

  const totalBudget = costCenters.reduce((s, cc) => s + Number(cc.allocatedBudget || 0), 0);
  const totalActual = costCenters.reduce((s, cc) => s + Number(cc.spentBudget || 0), 0);
  const totalVariance = totalBudget - totalActual;
  const overBudgetCount = costCenters.filter(
    (cc) => statusFor(Number(cc.allocatedBudget), Number(cc.spentBudget)) === 'over-budget'
  ).length;

  const stats = [
    {
      label: 'Total Budget',
      value: `$${totalBudget.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-600',
      subtext: `${costCenters.length} cost centers`,
    },
    {
      label: 'Total Spend',
      value: `$${totalActual.toLocaleString()}`,
      icon: TrendingUp,
      color: totalVariance >= 0 ? 'text-emerald-600' : 'text-red-600',
      subtext: totalBudget ? `${((totalActual / totalBudget) * 100).toFixed(1)}% of budget` : '—',
    },
    {
      label: 'Variance',
      value: `${totalVariance >= 0 ? '+' : ''}$${totalVariance.toLocaleString()}`,
      icon: totalVariance >= 0 ? TrendingDown : TrendingUp,
      color: totalVariance >= 0 ? 'text-emerald-600' : 'text-red-600',
      subtext: totalVariance >= 0 ? 'under budget' : 'over budget',
    },
    {
      label: 'Over Budget',
      value: `${overBudgetCount}`,
      icon: AlertCircle,
      color: overBudgetCount > 0 ? 'text-red-600' : 'text-emerald-600',
      subtext: 'cost centers',
    },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('warning', 'Name is required.');
      return;
    }
    setSaving(true);
    try {
      await CostCenterService.createCostCenter({
        code: form.code.trim() || undefined,
        name: form.name.trim(),
        fiscalYear: Number(form.fiscalYear) || new Date().getFullYear(),
        allocatedBudget: Number(form.allocatedBudget) || 0,
        spentBudget: Number(form.spentBudget) || 0,
      });
      showToast('success', 'Cost center added.');
      setShowModal(false);
      setForm({
        code: '',
        name: '',
        fiscalYear: String(new Date().getFullYear()),
        allocatedBudget: '',
        spentBudget: '',
      });
      await load();
    } catch {
      showToast('error', 'Failed to add cost center.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (costCenters.length === 0) {
      showToast('info', 'Nothing to export.');
      return;
    }
    exportToCsv(
      'cost-centers',
      costCenters.map((cc) => ({
        code: cc.code,
        name: cc.name,
        fiscalYear: cc.fiscalYear,
        allocatedBudget: cc.allocatedBudget,
        spentBudget: cc.spentBudget,
        variance: Number(cc.allocatedBudget) - Number(cc.spentBudget),
      }))
    );
    showToast('success', 'Export started.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismissToast} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-500" />
            Cost Centers
          </h1>
          <p className="text-slate-500 text-sm">
            Track allocated vs. spent budget by organizational unit
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Cost Center
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative flex-1 max-w-md shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search cost centers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No cost centers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Cost Center</th>
                    <th className="p-4">Code</th>
                    <th className="p-4">Fiscal Year</th>
                    <th className="p-4">Budget</th>
                    <th className="p-4">Actual Spend</th>
                    <th className="p-4">Variance</th>
                    <th className="p-4">Utilization</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((cc) => {
                    const budget = Number(cc.allocatedBudget || 0);
                    const spent = Number(cc.spentBudget || 0);
                    const variance = budget - spent;
                    const utilization = budget ? (spent / budget) * 100 : 0;
                    const status = statusFor(budget, spent);
                    return (
                      <tr
                        key={cc.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4 font-bold">{cc.name}</td>
                        <td className="p-4 font-mono text-xs text-slate-500">{cc.code}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {cc.fiscalYear ?? '—'}
                        </td>
                        <td className="p-4 font-mono">${budget.toLocaleString()}</td>
                        <td className="p-4 font-mono font-bold">${spent.toLocaleString()}</td>
                        <td className="p-4">
                          <span
                            className={`font-mono font-bold ${variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                          >
                            {variance >= 0 ? '+' : ''}${variance.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  utilization > 100
                                    ? 'bg-red-500'
                                    : utilization > 90
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-500">
                              {utilization.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${statusColor[status]} w-fit`}
                          >
                            {status === 'over-budget' ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            <span>{status.replace('-', ' ')}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Cost Center</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                required
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
              <input
                placeholder="Code (auto-generated if blank)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
              <input
                type="number"
                placeholder="Fiscal year"
                value={form.fiscalYear}
                onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
              <input
                type="number"
                placeholder="Allocated budget"
                value={form.allocatedBudget}
                onChange={(e) => setForm({ ...form, allocatedBudget: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
              <input
                type="number"
                placeholder="Spent budget"
                value={form.spentBudget}
                onChange={(e) => setForm({ ...form, spentBudget: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
