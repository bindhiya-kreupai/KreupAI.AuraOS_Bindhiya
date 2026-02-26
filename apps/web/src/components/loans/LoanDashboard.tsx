/**
 * @module LoanDashboard
 * @description Salary Advance & Loan dashboard — active loans, repayment progress,
 *              EMI schedule, loan history, and new application CTA (Sec 17.5)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Wallet,
  Calendar,
  ChevronRight,
  CircleDollarSign,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  LoanService,
  LOAN_STATUS_META,
  LOAN_TYPE_META,
  type Loan,
  type LoanPolicy,
} from '@/services/loanService';

// ── Progress Bar ───────────────────────────────────────────────────────────────

function LoanProgressBar({ loan }: { loan: Loan }) {
  const repaid = loan.totalRepayable - loan.outstandingBalance;
  const pct = loan.totalRepayable > 0 ? (repaid / loan.totalRepayable) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Repaid: ${repaid.toLocaleString()}</span>
        <span>Remaining: ${loan.outstandingBalance.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {Math.round(pct)}% repaid of ${loan.totalRepayable.toLocaleString()}
      </p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface LoanDashboardProps {
  employeeId?: string;
  onApply?: () => void;
  onViewLoan?: (loanId: string) => void;
}

export function LoanDashboard({ employeeId = 'emp-001', onApply, onViewLoan }: LoanDashboardProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [policies, setPolicies] = useState<LoanPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'policy'>('active');

  useEffect(() => {
    const load = async () => {
      const [l, p] = await Promise.all([
        LoanService.getLoans({ employeeId }),
        LoanService.getLoanPolicies(),
      ]);
      setLoans(l);
      setPolicies(p);
      setLoading(false);
    };
    load();
  }, [employeeId]);

  const activeLoans = loans.filter((l) =>
    ['active', 'approved', 'pending_approval'].includes(l.status)
  );
  const historyLoans = loans.filter((l) =>
    ['completed', 'rejected', 'cancelled'].includes(l.status)
  );

  const totalOutstanding = activeLoans
    .filter((l) => l.status === 'active')
    .reduce((s, l) => s + l.outstandingBalance, 0);
  const nextEMI = activeLoans
    .filter((l) => l.nextEMIAmount && l.status === 'active')
    .sort((a, b) => (a.nextEMIDate ?? '').localeCompare(b.nextEMIDate ?? ''))[0];

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans & Advances</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your loans and salary advances</p>
        </div>
        <button
          onClick={onApply}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Apply
        </button>
      </div>

      {/* Summary Cards */}
      {activeLoans.filter((l) => l.status === 'active').length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 opacity-80" />
              <p className="text-xs opacity-80">Total Outstanding</p>
            </div>
            <p className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</p>
            <p className="text-xs opacity-70 mt-0.5">
              {activeLoans.filter((l) => l.status === 'active').length} active loan(s)
            </p>
          </div>
          {nextEMI && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-amber-600">Next EMI Due</p>
              </div>
              <p className="text-2xl font-bold text-amber-700">
                ${nextEMI.nextEMIAmount?.toLocaleString()}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">{nextEMI.nextEMIDate}</p>
            </div>
          )}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <p className="text-xs text-emerald-600">Loans Repaid</p>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {historyLoans.filter((l) => l.status === 'completed').length}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">Completed successfully</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {(
          [
            ['active', 'Active'],
            ['history', 'History'],
            ['policy', 'Policies'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active Loans */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeLoans.length === 0 ? (
            <div className="text-center py-12">
              <CircleDollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-600">No active loans</p>
              <p className="text-sm text-gray-400 mt-1">Apply for a loan or salary advance</p>
              <button
                onClick={onApply}
                className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                Apply Now
              </button>
            </div>
          ) : (
            activeLoans.map((loan) => {
              const statusMeta = LOAN_STATUS_META[loan.status];
              const typeMeta = LOAN_TYPE_META[loan.type];
              return (
                <div
                  key={loan.id}
                  className="bg-white rounded-2xl p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-gray-900 text-lg">
                          ${loan.amount.toLocaleString()}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusMeta.bgColor} ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${typeMeta.color}`}>
                          {typeMeta.label}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{loan.loanNumber}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onViewLoan?.(loan.id)}
                      className="p-2 rounded-xl hover:bg-gray-50"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-xs text-gray-400">EMI</p>
                      <p className="font-bold text-gray-800 text-sm mt-0.5">
                        ${loan.emiAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">/month</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-xs text-gray-400">Tenure</p>
                      <p className="font-bold text-gray-800 text-sm mt-0.5">{loan.tenure} mo</p>
                      <p className="text-xs text-gray-400">{loan.emisPaid} paid</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-xs text-gray-400">Rate</p>
                      <p className="font-bold text-gray-800 text-sm mt-0.5">{loan.interestRate}%</p>
                      <p className="text-xs text-gray-400">per year</p>
                    </div>
                  </div>

                  {loan.status === 'active' && <LoanProgressBar loan={loan} />}

                  {loan.status === 'pending_approval' && (
                    <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 mt-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <p className="text-xs text-amber-700">Awaiting manager approval</p>
                    </div>
                  )}

                  {/* Repayment Schedule mini (first 3 upcoming) */}
                  {loan.repaymentSchedule.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Upcoming EMIs
                      </p>
                      <div className="space-y-1.5">
                        {loan.repaymentSchedule
                          .filter((e) => e.status === 'upcoming' || e.status === 'overdue')
                          .slice(0, 3)
                          .map((emi) => (
                            <div
                              key={emi.installmentNumber}
                              className={`flex justify-between text-xs py-1.5 px-2 rounded-lg ${
                                emi.status === 'overdue'
                                  ? 'bg-red-50 text-red-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {emi.status === 'overdue' ? (
                                  <AlertCircle className="w-3 h-3 text-red-500" />
                                ) : (
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                )}
                                EMI #{emi.installmentNumber} · {emi.dueDate}
                              </span>
                              <span className="font-semibold">
                                ${emi.totalEMI.toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyLoans.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-600">No loan history</p>
            </div>
          ) : (
            historyLoans.map((loan) => {
              const statusMeta = LOAN_STATUS_META[loan.status];
              const typeMeta = LOAN_TYPE_META[loan.type];
              return (
                <div key={loan.id} className="bg-white rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          ${loan.amount.toLocaleString()}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${statusMeta.bgColor} ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {typeMeta.label} · {loan.loanNumber}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>
                        {loan.completedDate
                          ? 'Completed'
                          : loan.status === 'rejected'
                            ? 'Rejected'
                            : ''}
                      </p>
                      <p>{loan.completedDate ?? loan.updatedAt.split('T')[0]}</p>
                    </div>
                  </div>
                  {loan.rejectionReason && (
                    <p className="text-xs text-red-600 mt-2 bg-red-50 rounded-lg px-3 py-1.5">
                      {loan.rejectionReason}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Policy Quick Reference */}
      {activeTab === 'policy' && (
        <div className="space-y-4">
          {policies.map((policy) => {
            const typeMeta = LOAN_TYPE_META[policy.loanType];
            return (
              <div key={policy.loanType} className="bg-white rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`font-bold text-lg ${typeMeta.color}`}>{typeMeta.label}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{policy.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Max Amount</p>
                    <p className="font-bold text-gray-800 mt-0.5">
                      ${policy.maxAmountAbsolute.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">or {policy.maxAmountMultiplier}x salary</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Max Tenure</p>
                    <p className="font-bold text-gray-800 mt-0.5">
                      {policy.maxTenureMonths} months
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Interest Rate</p>
                    <p className="font-bold text-gray-800 mt-0.5">
                      {policy.interestRate === 0 ? 'Interest-free' : `${policy.interestRate}% p.a.`}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Processing Fee</p>
                    <p className="font-bold text-gray-800 mt-0.5">
                      {policy.processingFeePercent === 0
                        ? 'Nil'
                        : `${policy.processingFeePercent}%`}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Eligibility</p>
                  <ul className="space-y-1">
                    {policy.eligibilityCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LoanDashboard;
