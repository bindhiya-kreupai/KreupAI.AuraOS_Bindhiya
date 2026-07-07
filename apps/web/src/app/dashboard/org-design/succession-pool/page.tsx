'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Target,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { APIClient } from '@/lib/api-client';
import { ToastContainer } from '../components/Toast';
import type { Toast } from '../types';

interface PoolMember {
  id: string;
  employeeId: string;
  employeeName: string;
  currentRole: string;
  readinessLevel: string;
  fitScore: number;
  riskOfLoss: string;
}

interface SuccessionPool {
  id: string;
  name: string;
  poolType: string;
  description: string;
  criticalRole: string;
  incumbentName?: string;
  retentionRisk: string;
  status: string;
  members: PoolMember[];
  totalMembers: number;
}

const READINESS_LABEL: Record<string, string> = {
  ready_now: 'Ready Now',
  ready_1_year: 'Ready in 1 Year',
  ready_2_3_years: 'Ready in 2-3 Years',
  not_ready: 'Not Ready',
};

const RISK_STYLE: Record<string, string> = {
  high: 'text-rose-600',
  medium: 'text-amber-500',
  low: 'text-emerald-500',
};

export default function SuccessionPoolPage() {
  const [pools, setPools] = useState<SuccessionPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    criticalRole: '',
    poolType: 'management',
    incumbentName: '',
    retentionRisk: 'medium',
  });
  const [memberForms, setMemberForms] = useState<
    Record<string, { employeeName: string; readinessLevel: string; fitScore: string }>
  >({});

  const addToast = useCallback((type: Toast['type'], message: string) => {
    setToasts((prev) => [...prev, { id: `t-${Date.now()}-${Math.random()}`, type, message }]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.get<unknown>('/org-design/succession');
      setPools(APIClient.unwrapList<SuccessionPool>(res));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load succession pools');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.criticalRole.trim()) {
      addToast('error', 'Pool name and critical role are required');
      return;
    }
    setSaving(true);
    try {
      await APIClient.post('/org-design/succession', {
        name: form.name.trim(),
        criticalRole: form.criticalRole.trim(),
        poolType: form.poolType,
        incumbentName: form.incumbentName.trim() || undefined,
        retentionRisk: form.retentionRisk,
      });
      addToast('success', 'Succession pool created');
      setShowForm(false);
      setForm({
        name: '',
        criticalRole: '',
        poolType: 'management',
        incumbentName: '',
        retentionRisk: 'medium',
      });
      await load();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create pool');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePool = async (id: string) => {
    try {
      await APIClient.delete(`/org-design/succession/${id}`);
      addToast('success', 'Pool deleted');
      await load();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete pool');
    }
  };

  const handleAddMember = async (poolId: string) => {
    const mf = memberForms[poolId];
    if (!mf || !mf.employeeName.trim()) {
      addToast('error', 'Candidate name is required');
      return;
    }
    try {
      await APIClient.post(`/org-design/succession/${poolId}/members`, {
        employeeId: `manual-${Date.now()}`,
        employeeName: mf.employeeName.trim(),
        readinessLevel: mf.readinessLevel || 'ready_2_3_years',
        fitScore: Number(mf.fitScore) || 0,
      });
      addToast('success', 'Candidate added to pool');
      setMemberForms((prev) => ({
        ...prev,
        [poolId]: { employeeName: '', readinessLevel: 'ready_now', fitScore: '' },
      }));
      await load();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to add candidate');
    }
  };

  const coverage =
    pools.length > 0
      ? Math.round((pools.filter((p) => p.members.length > 0).length / pools.length) * 100)
      : 0;
  const atRisk = pools.filter((p) => p.members.length === 0).length;
  const readyNow = pools.reduce(
    (sum, p) => sum + p.members.filter((m) => m.readinessLevel === 'ready_now').length,
    0
  );

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" />
            Succession Planning
          </h1>
          <p className="text-slate-500 text-sm">
            Identify critical roles and build talent pipelines.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Pool'}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Pool Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Critical Role *
            </label>
            <input
              value={form.criticalRole}
              onChange={(e) => setForm({ ...form, criticalRole: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
              placeholder="e.g. VP Engineering"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Incumbent
            </label>
            <input
              value={form.incumbentName}
              onChange={(e) => setForm({ ...form, incumbentName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Retention Risk
            </label>
            <select
              value={form.retentionRisk}
              onChange={(e) => setForm({ ...form, retentionRisk: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create Pool
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading pools...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <OverviewCard
              label="Succession Coverage"
              value={`${coverage}%`}
              icon={<ShieldCheck className="w-5 h-5" />}
              tone="indigo"
            />
            <OverviewCard
              label="Roles at Risk"
              value={String(atRisk)}
              icon={<AlertTriangle className="w-5 h-5" />}
              tone="rose"
              sub="No identified successors"
            />
            <OverviewCard
              label="Ready Now Candidates"
              value={String(readyNow)}
              icon={<UserCheck className="w-5 h-5" />}
              tone="emerald"
            />
          </div>

          {pools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
              <Target className="w-10 h-10" />
              <p className="text-sm">No succession pools yet. Create one to start planning.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pools.map((pool) => {
                const mf = memberForms[pool.id] ?? {
                  employeeName: '',
                  readinessLevel: 'ready_now',
                  fitScore: '',
                };
                return (
                  <div
                    key={pool.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-500 text-lg">
                          {pool.criticalRole.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{pool.criticalRole}</h3>
                          <div className="text-sm text-slate-500">
                            {pool.name}
                            {pool.incumbentName ? ` · Incumbent: ${pool.incumbentName}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-500 uppercase">
                            Retention Risk
                          </div>
                          <div
                            className={`text-sm font-bold ${RISK_STYLE[pool.retentionRisk] ?? ''}`}
                          >
                            {pool.retentionRisk}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeletePool(pool.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          aria-label="Delete pool"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <h4 className="font-bold text-sm text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Pipeline ({pool.members.length})
                      </h4>

                      {pool.members.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {pool.members.map((succ) => (
                            <div
                              key={succ.id}
                              className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                  {succ.employeeName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-sm">{succ.employeeName}</div>
                                  <div className="text-xs text-slate-500">
                                    {succ.currentRole || 'Candidate'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                                    Readiness
                                  </div>
                                  <div
                                    className={`text-xs font-bold ${
                                      succ.readinessLevel === 'ready_now'
                                        ? 'text-emerald-600'
                                        : 'text-amber-500'
                                    }`}
                                  >
                                    {READINESS_LABEL[succ.readinessLevel] ?? succ.readinessLevel}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                                    Fit
                                  </div>
                                  <div className="text-xs font-bold text-indigo-600">
                                    {succ.fitScore}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 text-sm gap-2 mb-4">
                          <AlertTriangle className="w-4 h-4" /> No successors identified yet.
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          value={mf.employeeName}
                          onChange={(e) =>
                            setMemberForms((prev) => ({
                              ...prev,
                              [pool.id]: { ...mf, employeeName: e.target.value },
                            }))
                          }
                          placeholder="Candidate name"
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        />
                        <select
                          value={mf.readinessLevel}
                          onChange={(e) =>
                            setMemberForms((prev) => ({
                              ...prev,
                              [pool.id]: { ...mf, readinessLevel: e.target.value },
                            }))
                          }
                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        >
                          <option value="ready_now">Ready Now</option>
                          <option value="ready_1_year">Ready 1 Year</option>
                          <option value="ready_2_3_years">Ready 2-3 Years</option>
                        </select>
                        <input
                          type="number"
                          value={mf.fitScore}
                          onChange={(e) =>
                            setMemberForms((prev) => ({
                              ...prev,
                              [pool.id]: { ...mf, fitScore: e.target.value },
                            }))
                          }
                          placeholder="Fit %"
                          min={0}
                          max={100}
                          className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => handleAddMember(pool.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OverviewCard({
  label,
  value,
  icon,
  tone,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: 'indigo' | 'rose' | 'emerald';
  sub?: string;
}) {
  const toneMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        {sub ? <div className="text-xs text-slate-400 mt-1">{sub}</div> : null}
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toneMap[tone]}`}>
        {icon}
      </div>
    </div>
  );
}
