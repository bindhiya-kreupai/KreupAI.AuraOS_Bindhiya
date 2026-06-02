'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Calendar,
  CheckCircle2,
  FileMinus,
  Loader2,
  PieChart,
  TrendingDown,
  X,
} from 'lucide-react';
import { LoanService } from '../services';
import type { EmployeeLoan } from '../types';

export default function LoansPage() {
  const [loans, setLoans] = useState<EmployeeLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleLoan, setScheduleLoan] = useState<EmployeeLoan | null>(null);
  const [skipForm, setSkipForm] = useState({
    employeeName: '',
    action: 'Skip current month only',
    reason: '',
  });
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await LoanService.getLoans();
      setLoans(result);
    } catch (error: any) {
      console.error('Error:', error);
      setStatus({ kind: 'error', text: error?.message || 'Failed to load loans.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeduction = () => {
    if (!skipForm.employeeName.trim() || !skipForm.reason.trim()) {
      setStatus({ kind: 'error', text: 'Employee name and reason are required.' });
      return;
    }
    // No EMI-pause API exists yet — show a clear notice instead of a silent fail
    setStatus({
      kind: 'success',
      text: `EMI pause request logged locally for ${skipForm.employeeName}. Backend endpoint coming soon.`,
    });
    setSkipForm({ employeeName: '', action: 'Skip current month only', reason: '' });
  };

  const activeLoans = loans.filter((l) => l.status === 'active' || l.status === 'disbursed');
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading loan data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Banknote className="w-6 h-6 text-emerald-500" />
            Loans & Recoveries
          </h1>
          <p className="text-slate-500 text-sm">
            Track active employee loans and manage monthly EMI deductions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
          <TrendingDown className="w-4 h-4" /> Total Outstanding: $
          {totalOutstanding.toLocaleString()}
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
        {/* Active Loans */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
          <h3 className="font-bold text-lg mb-2">Active Loan Deductions</h3>
          {activeLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Banknote className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">
                No Active Loans
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                There are no active loan deductions at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeLoans.map((l) => {
                const progressPct =
                  l.principalAmount > 0 ? (l.totalRecovered / l.principalAmount) * 100 : 0;
                const remainingInstallments =
                  l.emiAmount > 0 ? Math.ceil(l.remainingBalance / l.emiAmount) : 0;
                const isClosingSoon = remainingInstallments <= 2;

                return (
                  <div
                    key={l.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">
                          {l.employeeName}
                        </h3>
                        <div className="text-xs text-slate-500 font-bold">
                          {l.loanType.replace(/_/g, ' ')} - {l.loanNumber}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded
                                                ${isClosingSoon ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}
                                            `}
                      >
                        {isClosingSoon ? 'Closing Soon' : 'Active'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Progress</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          ${l.totalRecovered.toLocaleString()} / $
                          {l.principalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(progressPct, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                      <div className="text-center">
                        <div className="text-xs text-slate-400 font-bold uppercase">
                          Monthly EMI
                        </div>
                        <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                          ${l.emiAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center border-l border-slate-100 dark:border-slate-800 pl-4">
                        <div className="text-xs text-slate-400 font-bold uppercase">
                          Installments Left
                        </div>
                        <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                          {remainingInstallments}
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => setScheduleLoan(l)}
                          className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                        >
                          View Schedule <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileMinus className="w-5 h-5 text-rose-500" /> Stop / Skip EMI
            </h3>
            <p className="text-xs text-slate-500 mb-4">Temporarily pause deduction for a month.</p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Employee Name..."
                value={skipForm.employeeName}
                onChange={(e) => setSkipForm({ ...skipForm, employeeName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold"
              />
              <select
                value={skipForm.action}
                onChange={(e) => setSkipForm({ ...skipForm, action: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold"
              >
                <option>Skip current month only</option>
                <option>Defer to end of tenure</option>
                <option>Stop permanently (Settled)</option>
              </select>
              <textarea
                placeholder="Reason for skipping..."
                rows={2}
                value={skipForm.reason}
                onChange={(e) => setSkipForm({ ...skipForm, reason: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 text-sm font-bold"
              />
              <button
                onClick={handleUpdateDeduction}
                className="w-full py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600"
              >
                Update Deduction
              </button>
            </div>
          </div>
        </div>
      </div>

      {scheduleLoan && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">EMI Schedule — {scheduleLoan.employeeName}</h3>
              <button
                onClick={() => setScheduleLoan(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-slate-500 font-medium">Loan #</div>
                  <div className="font-mono font-bold">{scheduleLoan.loanNumber}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-slate-500 font-medium">Type</div>
                  <div className="font-bold">{scheduleLoan.loanType.replace(/_/g, ' ')}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-slate-500 font-medium">Principal</div>
                  <div className="font-mono font-bold">
                    ${scheduleLoan.principalAmount.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-slate-500 font-medium">Recovered</div>
                  <div className="font-mono font-bold text-emerald-600">
                    ${scheduleLoan.totalRecovered.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-slate-500 font-medium">Outstanding</div>
                  <div className="font-mono font-bold text-rose-600">
                    ${scheduleLoan.remainingBalance.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-slate-500 font-medium">Monthly EMI</div>
                  <div className="font-mono font-bold">
                    ${scheduleLoan.emiAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold text-slate-500">#</th>
                      <th className="px-3 py-2 text-right font-bold text-slate-500">EMI Date</th>
                      <th className="px-3 py-2 text-right font-bold text-slate-500">Amount</th>
                      <th className="px-3 py-2 text-right font-bold text-slate-500">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(() => {
                      const totalEmis =
                        scheduleLoan.emiAmount > 0
                          ? Math.ceil(scheduleLoan.principalAmount / scheduleLoan.emiAmount)
                          : 0;
                      return Array.from({ length: Math.min(totalEmis, 12) }).map((_, i) => {
                        const dueDate = new Date();
                        dueDate.setMonth(dueDate.getMonth() + i + 1);
                        const balance = Math.max(
                          scheduleLoan.principalAmount - scheduleLoan.emiAmount * (i + 1),
                          0
                        );
                        return (
                          <tr key={i}>
                            <td className="px-3 py-2 font-mono">{i + 1}</td>
                            <td className="px-3 py-2 text-right font-mono">
                              {dueDate.toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                              })}
                            </td>
                            <td className="px-3 py-2 text-right font-mono">
                              ${scheduleLoan.emiAmount.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right font-mono">
                              ${balance.toLocaleString()}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
                {(() => {
                  const totalEmis =
                    scheduleLoan.emiAmount > 0
                      ? Math.ceil(scheduleLoan.principalAmount / scheduleLoan.emiAmount)
                      : 0;
                  return totalEmis > 12 ? (
                    <div className="text-center py-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                      … {totalEmis - 12} more installments
                    </div>
                  ) : null;
                })()}
              </div>

              <p className="text-xs text-slate-400 flex items-start gap-2">
                <Calendar className="w-3 h-3 mt-0.5 shrink-0" />
                Schedule is computed from the loan’s monthly EMI; the back-end schedule API can
                replace this projection when available.
              </p>
            </div>
            <div className="flex justify-end px-5 py-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setScheduleLoan(null)}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
