'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Gift,
  Loader2,
  PieChart,
  Plus,
  Save,
  Users,
  X,
} from 'lucide-react';
import { BonusService } from '../services';
import type { Bonus } from '../types';

type NewBonusForm = {
  employeeId: string;
  employeeName: string;
  bonusType: string;
  amount: string;
  paymentMonth: string;
  notes: string;
};

const emptyForm: NewBonusForm = {
  employeeId: '',
  employeeName: '',
  bonusType: 'Performance',
  amount: '',
  paymentMonth: new Date().toISOString().slice(0, 7),
  notes: '',
};

export default function BonusProcessingPage() {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [editing, setEditing] = useState<NewBonusForm | null>(null);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBonuses();
  }, []);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const fetchBonuses = async () => {
    try {
      setLoading(true);
      const result = await BonusService.getBonuses();
      setBonuses(result);
    } catch (error: any) {
      console.error('Error:', error);
      setStatus({ kind: 'error', text: error?.message || 'Failed to load bonuses.' });
    } finally {
      setLoading(false);
    }
  };

  const createBonus = async () => {
    if (!editing) return;
    if (!editing.employeeId.trim() || !editing.amount) {
      setStatus({ kind: 'error', text: 'Employee ID and amount are required.' });
      return;
    }
    setCreating(true);
    setStatus(null);
    try {
      await BonusService.createBonus({
        employeeId: editing.employeeId,
        employeeName: editing.employeeName || undefined,
        bonusType: editing.bonusType,
        amount: Number(editing.amount),
        paymentMonth: editing.paymentMonth,
        notes: editing.notes || undefined,
        status: 'pending_approval',
      } as any);
      await fetchBonuses();
      setEditing(null);
      setStatus({ kind: 'success', text: 'Bonus created (pending approval).' });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: 'error', text: e?.message || 'Failed to create bonus.' });
    } finally {
      setCreating(false);
    }
  };

  const approveBonus = async (id: string) => {
    setApproving(id);
    setStatus(null);
    try {
      await BonusService.updateBonusStatus(id, 'approved' as any);
      await fetchBonuses();
      setStatus({ kind: 'success', text: 'Bonus approved.' });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: 'error', text: e?.message || 'Failed to approve bonus.' });
    } finally {
      setApproving(null);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'k';
    return '$' + amount.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const pendingBonuses = bonuses.filter(
    (b) => b.status === 'pending_approval' || b.status === 'approved'
  );
  const paidBonuses = bonuses.filter((b) => b.status === 'paid' || b.status === 'processed');
  const totalPool = pendingBonuses.reduce((sum, b) => sum + b.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading bonus data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-indigo-500" />
            Bonus Processing
          </h1>
          <p className="text-slate-500 text-sm">
            Calculate and distribute performance bonuses and incentives.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyForm })}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Bonus
        </button>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Active Cycle Card */}
        {pendingBonuses.length > 0 ? (
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group cursor-pointer lg:col-span-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-indigo-200 text-xs font-bold uppercase mb-1">
                    Pending Bonuses
                  </div>
                  <h3 className="text-2xl font-bold">
                    {pendingBonuses.length} Employee{pendingBonuses.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-bold backdrop-blur-sm">
                  In Progress
                </span>
              </div>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold">${totalPool.toLocaleString()}</span>
                <span className="text-indigo-200 font-bold mb-1">Total Pool</span>
              </div>
              <button
                onClick={() => {
                  const pending = pendingBonuses.filter((b) => b.status === 'pending_approval');
                  if (pending.length === 0) {
                    setStatus({ kind: 'success', text: 'No pending approvals — all reviewed.' });
                    return;
                  }
                  if (confirm(`Approve all ${pending.length} pending bonuses?`)) {
                    Promise.all(pending.map((b) => approveBonus(b.id))).catch(() => null);
                  }
                }}
                className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                Approve all pending <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 lg:col-span-2 flex items-center justify-center">
            <div className="text-center">
              <Gift className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">No pending bonuses</p>
            </div>
          </div>
        )}

        {/* History Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg mb-4">Past Payouts</h3>
          {paidBonuses.length === 0 ? (
            <div className="text-center text-slate-400 py-4 text-sm">No past bonus payouts.</div>
          ) : (
            <div className="space-y-4">
              {paidBonuses.slice(0, 5).map((bonus) => (
                <div
                  key={bonus.id}
                  className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-sm">{bonus.employeeName}</div>
                    <div className="text-xs text-slate-500">
                      {bonus.bonusType} - {bonus.paymentMonth}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    ${bonus.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {pendingBonuses.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg mb-4">Pending Bonuses</h3>
          <div className="space-y-2">
            {pendingBonuses.map((b) => (
              <div
                key={b.id}
                className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
              >
                <div>
                  <div className="font-bold text-sm">{b.employeeName}</div>
                  <div className="text-xs text-slate-500">
                    {b.bonusType} • {b.paymentMonth}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    ${b.amount.toLocaleString()}
                  </div>
                  {b.status === 'pending_approval' && (
                    <button
                      onClick={() => approveBonus(b.id)}
                      disabled={approving === b.id}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {approving === b.id ? 'Approving…' : 'Approve'}
                    </button>
                  )}
                  {b.status === 'approved' && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                      Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg mb-4">Bonus Rules Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <Calculator className="w-5 h-5 text-indigo-500 mb-2" />
            <h4 className="font-bold text-sm">Formula Builder</h4>
            <p className="text-xs text-slate-500 mt-1">
              Configure payout based on salary % or fixed amount.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <Users className="w-5 h-5 text-indigo-500 mb-2" />
            <h4 className="font-bold text-sm">Eligibility Criteria</h4>
            <p className="text-xs text-slate-500 mt-1">
              Define active duration and performance rating rules.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <PieChart className="w-5 h-5 text-indigo-500 mb-2" />
            <h4 className="font-bold text-sm">Budget Allocation</h4>
            <p className="text-xs text-slate-500 mt-1">Set department-wise bonus pool limits.</p>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">New bonus</h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Employee ID *</span>
                <input
                  value={editing.employeeId}
                  onChange={(e) => setEditing({ ...editing, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Employee name</span>
                <input
                  value={editing.employeeName}
                  onChange={(e) => setEditing({ ...editing, employeeName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Bonus type</span>
                <select
                  value={editing.bonusType}
                  onChange={(e) => setEditing({ ...editing, bonusType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <option>Performance</option>
                  <option>Annual</option>
                  <option>Spot</option>
                  <option>Sales commission</option>
                  <option>Retention</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Amount *</span>
                <input
                  type="number"
                  value={editing.amount}
                  onChange={(e) => setEditing({ ...editing, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-500 mb-1">Payment month</span>
                <input
                  type="month"
                  value={editing.paymentMonth}
                  onChange={(e) => setEditing({ ...editing, paymentMonth: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-xs font-medium text-slate-500 mb-1">Notes</span>
                <textarea
                  rows={2}
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 resize-none"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createBonus}
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {creating ? 'Creating…' : 'Create bonus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
