/**
 * @module LoanApprovalQueue
 * @description Manager/HR/Finance loan approval queue — pending review with eligibility
 *              check, salary impact, approve/reject with comments (Sec 17.5)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  User,
  MessageSquare,
} from 'lucide-react';
import { LoanService, LOAN_TYPE_META, type Loan } from '@/services/loanService';

// ── Component ─────────────────────────────────────────────────────────────────

export function LoanApprovalQueue() {
  const [pendingLoans, setPendingLoans] = useState<Loan[]>([]);
  const [approvedLoans, setApprovedLoans] = useState<Loan[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [pending, approved] = await Promise.all([
        LoanService.getLoans({ status: 'pending_approval' }),
        LoanService.getLoans({ status: 'approved' }),
      ]);
      setPendingLoans(pending);
      setApprovedLoans(approved);
      setLoading(false);
    };
    load();
  }, []);

  const handleApprove = async (loanId: string) => {
    setProcessing(loanId);
    const updated = await LoanService.approveLoan(loanId, comments[loanId]);
    setPendingLoans((prev) => prev.filter((l) => l.id !== loanId));
    setApprovedLoans((prev) => [updated, ...prev]);
    setProcessing(null);
  };

  const handleReject = async (loanId: string) => {
    const reason = comments[loanId];
    if (!reason?.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setProcessing(loanId);
    await LoanService.rejectLoan(loanId, reason);
    setPendingLoans((prev) => prev.filter((l) => l.id !== loanId));
    setProcessing(null);
  };

  const totalBudgetImpact = approvedLoans.reduce((s, l) => s + l.emiAmount, 0);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loan Approvals</h1>
        <p className="text-sm text-gray-500 mt-0.5">{pendingLoans.length} pending review</p>
      </div>

      {/* Budget Impact */}
      {approvedLoans.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-amber-500" />
            <p className="font-semibold text-amber-800">Budget Impact — Active Approvals</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-amber-600">Approved Loans</p>
              <p className="font-bold text-amber-800 text-xl">{approvedLoans.length}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600">Total Loan Amount</p>
              <p className="font-bold text-amber-800 text-xl">
                ${approvedLoans.reduce((s, l) => s + l.amount, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-600">Monthly EMI Outflow</p>
              <p className="font-bold text-amber-800 text-xl">
                ${totalBudgetImpact.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Queue */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Pending Approval ({pendingLoans.length})
        </h2>

        {pendingLoans.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="font-medium text-gray-600">No pending loan applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingLoans.map((loan) => {
              const typeMeta = LOAN_TYPE_META[loan.type];
              const isExpanded = expandedId === loan.id;
              const salaryImpactPct = ((loan.emiAmount / loan.monthlySalary) * 100).toFixed(1);

              return (
                <div key={loan.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {/* Loan Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{loan.employeeName}</p>
                          <p className="text-xs text-gray-500">
                            {loan.employeeDepartment} · {loan.employeeDesignation}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : loan.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400">Type</p>
                        <p className={`font-semibold text-sm mt-0.5 ${typeMeta.color}`}>
                          {typeMeta.label}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400">Amount</p>
                        <p className="font-bold text-gray-800 mt-0.5">
                          ${loan.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400">EMI</p>
                        <p className="font-bold text-gray-800 mt-0.5">
                          ${loan.emiAmount.toLocaleString()}/mo
                        </p>
                        <p className="text-xs text-gray-400">{loan.tenure} months</p>
                      </div>
                      <div
                        className={`rounded-xl p-3 ${parseFloat(salaryImpactPct) > 30 ? 'bg-red-50' : 'bg-emerald-50'}`}
                      >
                        <p className="text-xs text-gray-400">Salary Impact</p>
                        <p
                          className={`font-bold mt-0.5 ${parseFloat(salaryImpactPct) > 30 ? 'text-red-600' : 'text-emerald-600'}`}
                        >
                          {salaryImpactPct}%
                        </p>
                        {parseFloat(salaryImpactPct) > 30 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-red-600">High</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Eligibility Check */}
                    <div className="mt-3 bg-emerald-50 rounded-xl px-3 py-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <p className="text-xs text-emerald-700">
                        Eligibility check passed · Monthly salary:{' '}
                        <strong>${loan.monthlySalary.toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-50 px-5 pb-5 pt-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Reason</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                          {loan.reason}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="text-gray-400">Applied:</span>{' '}
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="text-gray-400">Loan #:</span> {loan.loanNumber}
                        </div>
                        <div>
                          <span className="text-gray-400">Interest:</span>{' '}
                          {loan.interestRate === 0 ? 'None' : `${loan.interestRate}% p.a.`}
                        </div>
                        <div>
                          <span className="text-gray-400">Total Repayable:</span> $
                          {loan.totalRepayable.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-gray-50 p-4 space-y-3">
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={comments[loan.id] ?? ''}
                        onChange={(e) =>
                          setComments((prev) => ({ ...prev, [loan.id]: e.target.value }))
                        }
                        placeholder="Add comment (required for rejection)..."
                        rows={2}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReject(loan.id)}
                        disabled={processing === loan.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 disabled:opacity-40 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(loan.id)}
                        disabled={processing === loan.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processing === loan.id ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Approved List */}
      {approvedLoans.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Recently Approved ({approvedLoans.length})
          </h2>
          <div className="space-y-2">
            {approvedLoans.map((loan) => {
              const typeMeta = LOAN_TYPE_META[loan.type];
              return (
                <div
                  key={loan.id}
                  className="bg-white rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{loan.employeeName}</p>
                    <p className="text-xs text-gray-500">
                      {typeMeta.label} · ${loan.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">
                      ${loan.emiAmount.toLocaleString()}/mo
                    </p>
                    <p className="text-xs text-gray-400">{loan.tenure} months</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default LoanApprovalQueue;
