'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Download,
  Printer,
  MoreHorizontal,
} from 'lucide-react';
import type { ExpenseReport } from '@/services/expenseService';
import { ExpenseService, EXPENSE_STATUS_META } from '@/services/expenseService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ExpenseReportDetailProps {
  reportId: string;
  onBack?: () => void;
  onApprove?: (reportId: string) => void;
  onReject?: (reportId: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-500 flex-shrink-0 w-36">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-right">
        {value}
      </span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ExpenseReportDetail({
  reportId,
  onBack,
  onApprove,
  onReject,
}: ExpenseReportDetailProps) {
  const [report, setReport] = useState<ExpenseReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'approvals' | 'audit'>('items');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ExpenseService.getExpenseReport(reportId);
        setReport(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reportId]);

  const handleApprove = async () => {
    if (!report) return;
    setActionLoading(true);
    try {
      const updated = await ExpenseService.approveReport(report.id, 'current-user');
      setReport(updated);
      onApprove?.(report.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!report || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const updated = await ExpenseService.rejectReport(report.id, rejectReason);
      setReport(updated);
      setShowRejectDialog(false);
      onReject?.(report.id);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-16 text-center">
        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Report not found</p>
        <button onClick={onBack} className="mt-4 text-sm text-indigo-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const meta = EXPENSE_STATUS_META[report.status];
  const canApprove = report.status === 'submitted' || report.status === 'pending_approval';

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {report.reportName}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{report.reportCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${meta.bgColor} ${meta.color}`}
          >
            {meta.label}
          </span>

          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: DollarSign,
            label: 'Total Amount',
            value: `$${report.totalAmount.toLocaleString()}`,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
          },
          {
            icon: DollarSign,
            label: 'Reimbursable',
            value: `$${report.reimbursableAmount.toLocaleString()}`,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          },
          {
            icon: Receipt,
            label: 'Items',
            value: String(report.items.length),
            color: 'text-violet-600',
            bg: 'bg-violet-50 dark:bg-violet-900/20',
          },
          {
            icon: Calendar,
            label: 'Period',
            value: `${report.reportPeriod.startDate} – ${report.reportPeriod.endDate}`,
            color: 'text-slate-600',
            bg: 'bg-slate-100 dark:bg-slate-800',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${card.bg}`}
            >
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">{card.label}</p>
              <p className={`text-sm font-bold mt-0.5 truncate ${card.color}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details + tabs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
            {(['items', 'approvals', 'audit'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab: Items */}
          {activeTab === 'items' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {report.items.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No items in this report
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {report.items.map((item) => (
                    <div key={item.id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-400">
                            <span>{item.date}</span>
                            <span>&middot; {item.categoryName}</span>
                            {item.merchant && <span>&middot; {item.merchant}</span>}
                            {item.location && <span>&middot; {item.location}</span>}
                            <span>&middot; {item.paymentMethod.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="flex gap-3 mt-2">
                            {item.isReimbursable && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                Reimbursable
                              </span>
                            )}
                            {item.isBillable && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                Billable
                              </span>
                            )}
                            {item.policyViolations.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                                <AlertTriangle className="w-3 h-3" />
                                {item.policyViolations.length} violation
                                {item.policyViolations.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                            ${item.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.currency}</p>
                          {item.receipt && (
                            <span
                              className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.receipt.status === 'verified'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.receipt.status === 'uploaded'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-slate-50 text-slate-500'
                              }`}
                            >
                              <Receipt className="w-3 h-3" />
                              {item.receipt.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total row */}
              {report.items.length > 0 && (
                <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Total
                  </span>
                  <span className="text-lg font-bold text-indigo-600">
                    ${report.totalAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tab: Approvals */}
          {activeTab === 'approvals' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {report.approvalChain.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No approval records yet
                </div>
              ) : (
                report.approvalChain.map((approval) => {
                  const isApproved = approval.status === 'approved';
                  const isRejected = approval.status === 'rejected';
                  return (
                    <div key={approval.id} className="p-5 flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isApproved
                            ? 'bg-emerald-50 dark:bg-emerald-900/20'
                            : isRejected
                              ? 'bg-red-50 dark:bg-red-900/20'
                              : 'bg-amber-50 dark:bg-amber-900/20'
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : isRejected ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {approval.approverName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {approval.approverTitle} &middot; Level {approval.approverLevel}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-700'
                                : isRejected
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {approval.status}
                          </span>
                        </div>
                        {approval.comments && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                            &ldquo;{approval.comments}&rdquo;
                          </p>
                        )}
                        {approval.approvedDate && (
                          <p className="text-xs text-slate-400 mt-1.5">
                            {new Date(approval.approvedDate).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab: Audit */}
          {activeTab === 'audit' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {report.auditTrail.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">No audit events yet</div>
              ) : (
                report.auditTrail.map((log) => (
                  <div key={log.id} className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        <span className="font-semibold">{log.userName}</span>{' '}
                        <span className="text-slate-500 capitalize">{log.action}</span> this report
                      </p>
                      {log.details !== `${log.action} expense report` && (
                        <p className="text-xs text-slate-400 mt-0.5">{log.details}</p>
                      )}
                      <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          {/* Reporter info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Report Details
            </h3>
            <InfoRow label="Employee" value={report.employeeName} />
            <InfoRow label="Department" value={report.departmentName} />
            <InfoRow label="Manager" value={report.managerName} />
            <InfoRow
              label="Submitted"
              value={
                report.submittedDate ? new Date(report.submittedDate).toLocaleDateString() : '—'
              }
            />
            {report.approvedDate && (
              <InfoRow
                label="Approved"
                value={new Date(report.approvedDate).toLocaleDateString()}
              />
            )}
            {report.paidDate && <InfoRow label="Paid" value={report.paidDate} />}
            {report.notes && <InfoRow label="Notes" value={report.notes} />}
          </div>

          {/* Reimbursement info */}
          {report.reimbursement && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Reimbursement
              </h3>
              <InfoRow label="Amount" value={`$${report.reimbursement.amount.toLocaleString()}`} />
              <InfoRow
                label="Method"
                value={report.reimbursement.paymentMethod.replace(/_/g, ' ')}
              />
              <InfoRow
                label="Status"
                value={
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      report.reimbursement.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {report.reimbursement.status}
                  </span>
                }
              />
              {report.reimbursement.paymentReference && (
                <InfoRow label="Reference" value={report.reimbursement.paymentReference} />
              )}
            </div>
          )}

          {/* Tags */}
          {report.tags.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Approve / Reject actions */}
          {canApprove && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</h3>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading ? 'Processing...' : 'Approve Report'}
              </button>
              <button
                onClick={() => setShowRejectDialog(true)}
                disabled={actionLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 text-sm font-semibold rounded-xl transition-colors border border-red-200 dark:border-red-800"
              >
                <XCircle className="w-4 h-4" />
                Reject Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Reject Report
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Provide a reason for rejecting this expense report.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
