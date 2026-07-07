'use client';

import React, { useState, useEffect } from 'react';
import { History, AlertCircle, Calculator, Loader2, X } from 'lucide-react';
import { ArrearsService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface ArrearsForm {
  employeeId: string;
  arrearsType: string;
  reason: string;
  effectiveFrom: string;
  effectiveTo: string;
  oldSalary: string;
  newSalary: string;
}

const EMPTY_FORM: ArrearsForm = {
  employeeId: '',
  arrearsType: 'salary_revision',
  reason: '',
  effectiveFrom: '',
  effectiveTo: '',
  oldSalary: '',
  newSalary: '',
};

export default function ArrearsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ArrearsForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [calculatingId, setCalculatingId] = useState<string | null>(null);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await ArrearsService.getRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error:', err);
      error('Failed to load arrears requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.effectiveFrom || !form.effectiveTo) {
      error('Employee, effective from and effective to are required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await ArrearsService.createRequest({
        employeeId: form.employeeId,
        arrearsType: form.arrearsType as any,
        reason: form.reason,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo,
        oldSalary: Number(form.oldSalary) || 0,
        newSalary: Number(form.newSalary) || 0,
      } as any);
      // Immediately run the arrears calculation on the new draft.
      if (created?.id) {
        await ArrearsService.runCalculation(created.id);
      }
      success('Arrears request created and calculated');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      await fetchData();
    } catch (err) {
      console.error(err);
      error('Failed to create arrears request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunCalculation = async (id: string) => {
    setCalculatingId(id);
    try {
      await ArrearsService.runCalculation(id);
      success('Arrears recalculated');
      await fetchData();
    } catch (err) {
      console.error(err);
      error('Failed to recalculate arrears');
    } finally {
      setCalculatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const pendingRequests = requests.filter(
    (r: any) => r.status === 'pending' || r.status === 'submitted' || r.status === 'draft'
  );
  const totalPendingAmount = pendingRequests.reduce(
    (sum: number, r: any) => sum + (Number(r.totalArrears) || 0),
    0
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-amber-500" />
            Arrears Processing
          </h1>
          <p className="text-slate-500 text-sm">
            Calculate and process back-dated salary adjustments.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          <Calculator className="w-4 h-4" /> Run Calculation
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {pendingRequests.length > 0 && (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-amber-50 dark:bg-amber-900/10">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>
                Pending Arrears: ${totalPendingAmount.toLocaleString()} ({pendingRequests.length}{' '}
                request
                {pendingRequests.length !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No arrears requests found. Use &quot;Run Calculation&quot; to create and calculate
            arrears.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Effective From</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 text-right">Arrear Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((row: any) => {
                  const amount = Number(row.totalArrears) || 0;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                        {row.employeeId || '--'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {row.effectiveFrom
                          ? new Date(row.effectiveFrom).toLocaleDateString()
                          : '--'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {row.reason || row.arrearsType || '--'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-600">
                        ${amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            row.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : row.status === 'processed'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRunCalculation(row.id)}
                          disabled={calculatingId === row.id}
                          className="text-xs font-bold text-indigo-500 hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {calculatingId === row.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Calculator className="w-3 h-3" />
                          )}
                          Recalculate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Arrears Calculation</h2>
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
                <span className="text-slate-500 font-medium">Employee ID</span>
                <input
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Old Salary</span>
                <input
                  type="number"
                  value={form.oldSalary}
                  onChange={(e) => setForm({ ...form, oldSalary: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">New Salary</span>
                <input
                  type="number"
                  value={form.newSalary}
                  onChange={(e) => setForm({ ...form, newSalary: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Effective From</span>
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Effective To</span>
                <input
                  type="date"
                  value={form.effectiveTo}
                  onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Reason</span>
                <input
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
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
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create &amp; Calculate
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
