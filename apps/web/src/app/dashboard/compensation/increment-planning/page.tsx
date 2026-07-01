'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Save, Send, Loader2, X } from 'lucide-react';
import { IncrementCycleService, IncrementProposalService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface ProposalForm {
  cycleId: string;
  employeeId: string;
  currentSalary: string;
  proposedSalary: string;
  justification: string;
}

const EMPTY_FORM: ProposalForm = {
  cycleId: '',
  employeeId: '',
  currentSalary: '',
  proposedSalary: '',
  justification: '',
};

export default function CompPlanningPage() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProposalForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cyclesData, proposalsData] = await Promise.all([
        IncrementCycleService.getCycles(),
        IncrementProposalService.getProposals(),
      ]);
      setCycles(cyclesData);
      setProposals(proposalsData);
    } catch (err) {
      console.error('Error:', err);
      error('Failed to load increment planning data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm({ ...EMPTY_FORM, cycleId: cycles.length > 0 ? cycles[0].id : '' });
    setModalOpen(true);
  };

  const handleCreate = async (status: 'draft' | 'submitted') => {
    if (!form.cycleId || !form.employeeId) {
      error('Cycle and employee are required');
      return;
    }
    setSubmitting(true);
    try {
      await IncrementProposalService.createProposal({
        cycleId: form.cycleId,
        employeeId: form.employeeId,
        currentSalary: Number(form.currentSalary) || 0,
        proposedSalary: Number(form.proposedSalary) || 0,
        justification: form.justification,
        status,
      } as any);
      success(status === 'draft' ? 'Proposal saved as draft' : 'Proposal submitted');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      await fetchData();
    } catch (err) {
      console.error(err);
      error('Failed to create proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCycle = cycles.length > 0 ? cycles[0] : null;
  const totalBudget = activeCycle?.budgetAmount ?? 0;
  const cycleUsedFromProposals = activeCycle
    ? proposals
        .filter((p: any) => p.cycleId === activeCycle.id)
        .reduce((sum: number, p: any) => sum + (Number(p.incrementAmount) || 0), 0)
    : 0;
  const totalUsed = (activeCycle?.totalUsed ?? 0) || cycleUsedFromProposals;
  const budgetUsedPct = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            Increment Planning {activeCycle ? `(${activeCycle.cycleName})` : ''}
          </h1>
          <p className="text-slate-500 text-sm">
            Manage annual merit increases, bonus allocations, and budget distributions.
          </p>
        </div>
        {activeCycle && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-xs text-slate-500 font-bold uppercase">Budget Utilization</div>
              <div className="text-sm font-bold text-emerald-600">{budgetUsedPct}% Used</div>
            </div>
            <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${budgetUsedPct}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0">
        {/* Sidebar Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="text-indigo-100 font-bold text-sm mb-1">Total Budget</div>
            <div className="text-3xl font-bold">
              {totalBudget > 0 ? `$${(totalBudget / 1000).toFixed(0)}K` : '--'}
            </div>
            <div className="flex justify-between text-xs opacity-80 border-t border-white/20 pt-3 mt-4">
              <span>Used: ${totalUsed > 0 ? (totalUsed / 1000).toFixed(0) + 'K' : '0'}</span>
              <span>
                Remaining: $
                {totalBudget > totalUsed
                  ? ((totalBudget - totalUsed) / 1000).toFixed(0) + 'K'
                  : '0'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm mb-4">Cycle Status</h3>
            {cycles.length === 0 ? (
              <p className="text-xs text-slate-400">No increment cycles found.</p>
            ) : (
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                {cycles.map((cycle: any) => (
                  <li key={cycle.id} className="flex justify-between">
                    <span>{cycle.cycleName}</span>
                    <span
                      className={`font-bold ${cycle.status === 'approved' ? 'text-emerald-600' : cycle.status === 'in_progress' ? 'text-amber-600' : 'text-slate-400'}`}
                    >
                      {cycle.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Worksheet */}
        <div className="lg:col-span-3 overflow-y-auto pb-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Increment Proposals</h3>
              <div className="flex gap-2">
                <button
                  onClick={openModal}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                  title="New Proposal"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={openModal}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> New Proposal
                </button>
              </div>
            </div>

            {proposals.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No increment proposals found. Create proposals for the active cycle.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3 pl-4">Employee</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Current Pay</th>
                    <th className="py-3">Increment %</th>
                    <th className="py-3 w-32 pr-4 text-right">Proposed Pay</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {proposals.map((row: any) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                    >
                      <td className="py-4 pl-4 font-bold text-slate-700 dark:text-slate-300">
                        {row.employeeName || row.employeeId}
                      </td>
                      <td className="py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded ${
                            row.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-600'
                              : row.status === 'submitted'
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-slate-500">
                        ${row.currentSalary ? Number(row.currentSalary).toLocaleString() : '--'}
                      </td>
                      <td className="py-4 font-bold text-emerald-600">
                        {row.incrementPercentage ? `+${row.incrementPercentage}%` : '--'}
                      </td>
                      <td className="py-4 pr-4 text-right font-bold text-emerald-600">
                        ${row.proposedSalary ? Number(row.proposedSalary).toLocaleString() : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Increment Proposal</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Cycle</span>
                <select
                  value={form.cycleId}
                  onChange={(e) => setForm({ ...form, cycleId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                >
                  <option value="">Select a cycle</option>
                  {cycles.map((cycle: any) => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.cycleName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Employee ID</span>
                <input
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Current Salary</span>
                <input
                  type="number"
                  value={form.currentSalary}
                  onChange={(e) => setForm({ ...form, currentSalary: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Proposed Salary</span>
                <input
                  type="number"
                  value={form.proposedSalary}
                  onChange={(e) => setForm({ ...form, proposedSalary: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Justification</span>
                <input
                  value={form.justification}
                  onChange={(e) => setForm({ ...form, justification: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreate('draft')}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-bold border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleCreate('submitted')}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
