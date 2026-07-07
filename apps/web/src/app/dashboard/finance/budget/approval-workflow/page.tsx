'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, UserCheck, FileText, Loader2 } from 'lucide-react';
import { BudgetService } from '../../services';
import { ToastContainer, useToast } from '../../components/Toast';

export default function ApprovalWorkflowPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { toasts, showToast, dismissToast } = useToast();

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await BudgetService.getBudgets();
      setBudgets(data);
    } catch {
      showToast('error', 'Failed to load budget requests.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      await BudgetService.approveBudget(id, '');
      showToast('success', 'Budget approved.');
      await fetchData();
    } catch {
      showToast('error', 'Failed to approve budget.');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActingId(rejectTarget);
    try {
      await BudgetService.rejectBudget(rejectTarget, rejectReason.trim() || 'Rejected');
      showToast('success', 'Budget rejected.');
      setRejectTarget(null);
      setRejectReason('');
      await fetchData();
    } catch {
      showToast('error', 'Failed to reject budget.');
    } finally {
      setActingId(null);
    }
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
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-lg font-bold">Reject Budget</h2>
            <textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm min-h-[90px]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actingId === rejectTarget}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-500" />
            Budget Approvals
          </h1>
          <p className="text-slate-500 text-sm">Review and approve department budget requests.</p>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-bold">No approval requests found</p>
            <p className="text-sm">Budget approval requests will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {budgets.map((req: any) => {
              const status = req.approvalStatus || req.status || 'pending';
              return (
                <div
                  key={req.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-xl ${
                        status === 'approved'
                          ? 'bg-emerald-100 text-emerald-600'
                          : status === 'pending'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-indigo-100 text-indigo-600'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {req.name || req.title || 'Budget Request'}
                      </h3>
                      <div className="text-sm text-slate-500 flex gap-3">
                        <span>{req.department || '-'}</span>
                        <span>•</span>
                        <span>Period: {req.fiscalYear || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        ${Number(req.totalBudget || req.totalAmount || 0).toLocaleString()}
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          status === 'approved'
                            ? 'text-emerald-500'
                            : status === 'pending'
                              ? 'text-amber-500'
                              : 'text-indigo-500'
                        }`}
                      >
                        {status}
                      </div>
                    </div>

                    {status !== 'approved' && status !== 'rejected' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={actingId === req.id}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1"
                        >
                          {actingId === req.id && <Loader2 className="w-4 h-4 animate-spin" />}{' '}
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectTarget(req.id);
                            setRejectReason('');
                          }}
                          disabled={actingId === req.id}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
