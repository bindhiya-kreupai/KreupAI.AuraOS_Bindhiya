"use client";

import React, { useState, useEffect } from "react";
import { History, CheckCircle, XCircle, FileText, Clock, User } from "lucide-react";

type ApprovalDecision = "approved" | "rejected";
type RequestType = "leave" | "expense" | "timesheet" | "requisition" | "document";

interface ApprovalHistoryEntry {
  id: string;
  requestType: RequestType;
  title: string;
  requester: string;
  requesterDepartment: string;
  decision: ApprovalDecision;
  decisionDate: string;
  notes: string;
}

interface ApprovalHistoryProps {
  entries?: ApprovalHistoryEntry[];
}

const requestTypeLabels: Record<RequestType, string> = {
  leave: "Leave",
  expense: "Expense",
  timesheet: "Timesheet",
  requisition: "Requisition",
  document: "Document",
};

const decisionConfig: Record<ApprovalDecision, { icon: typeof CheckCircle; label: string; classes: string }> = {
  approved: {
    icon: CheckCircle,
    label: "Approved",
    classes: "text-green-600 dark:text-green-400",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    classes: "text-red-500 dark:text-red-400",
  },
};

export function ApprovalHistory({ entries: propEntries }: ApprovalHistoryProps) {
  const [entries, setEntries] = useState<ApprovalHistoryEntry[]>(propEntries || []);
  const [loading, setLoading] = useState(!propEntries);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propEntries) {
      setEntries(propEntries);
      return;
    }

    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const [leaveRes, expenseRes, requisitionRes] = await Promise.allSettled([
          fetch('/api/v1/leave/apply').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/compensation/expense-claims').then(r => r.json()).catch(() => null),
          fetch('/api/recruitment/requisitions').then(r => r.json()).catch(() => null),
        ]);

        const historyItems: ApprovalHistoryEntry[] = [];

        // Leave history - completed leave requests (APPROVED or REJECTED)
        if (leaveRes.status === 'fulfilled' && leaveRes.value?.success) {
          const completedLeaves = (leaveRes.value.data || []).filter(
            (r: Record<string, unknown>) => r.status === 'APPROVED' || r.status === 'REJECTED'
          );
          historyItems.push(...completedLeaves.map((l: Record<string, unknown>) => ({
            id: `leave-${l.id}`,
            requestType: 'leave' as RequestType,
            title: `Leave Request - ${l.totalDays || '?'} day(s)`,
            requester: (l.employeeName as string) || (l.employeeId as string) || 'Employee',
            requesterDepartment: (l.department as string) || '',
            decision: ((l.status as string) || '').toLowerCase() === 'approved' ? 'approved' as ApprovalDecision : 'rejected' as ApprovalDecision,
            decisionDate: (l.updatedAt as string) || (l.createdAt as string) || '',
            notes: (l.reason as string) || '',
          })));
        }

        // Expense history - completed claims
        if (expenseRes.status === 'fulfilled' && expenseRes.value?.success) {
          const completedExpenses = (expenseRes.value.data || []).filter(
            (e: Record<string, unknown>) => e.status === 'approved' || e.status === 'rejected'
          );
          historyItems.push(...completedExpenses.map((e: Record<string, unknown>) => ({
            id: `expense-${e.id}`,
            requestType: 'expense' as RequestType,
            title: (e.title as string) || 'Expense Claim',
            requester: (e.employeeName as string) || (e.employeeId as string) || 'Employee',
            requesterDepartment: (e.category as string) || '',
            decision: (e.status as string) === 'approved' ? 'approved' as ApprovalDecision : 'rejected' as ApprovalDecision,
            decisionDate: (e.approvedAt as string) || (e.updatedAt as string) || '',
            notes: (e.rejectionReason as string) || (e.description as string) || '',
          })));
        }

        // Requisition history - completed requisitions
        if (requisitionRes.status === 'fulfilled' && requisitionRes.value?.success) {
          const completedReqs = (requisitionRes.value.data || []).filter(
            (r: Record<string, unknown>) => r.approvalStatus === 'Approved' || r.approvalStatus === 'Rejected'
          );
          historyItems.push(...completedReqs.map((r: Record<string, unknown>) => ({
            id: `requisition-${r.id}`,
            requestType: 'requisition' as RequestType,
            title: (r.jobTitle as string) || 'Job Requisition',
            requester: (r.requestedBy as string) || 'Manager',
            requesterDepartment: (r.department as string) || '',
            decision: (r.approvalStatus as string) === 'Approved' ? 'approved' as ApprovalDecision : 'rejected' as ApprovalDecision,
            decisionDate: (r.approvedDate as string) || (r.updatedAt as string) || '',
            notes: (r.rejectionReason as string) || (r.justification as string) || '',
          })));
        }

        // Sort by decision date descending
        historyItems.sort((a, b) => {
          const dateA = a.decisionDate ? new Date(a.decisionDate).getTime() : 0;
          const dateB = b.decisionDate ? new Date(b.decisionDate).getTime() : 0;
          return dateB - dateA;
        });

        setEntries(historyItems);
      } catch (err) {
        console.error('Failed to fetch approval history:', err);
        setError('Failed to load approval history.');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [propEntries]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30 p-6 text-center">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-2 mb-5">
        <History className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
          Approval History
        </h3>
        <span className="ml-auto text-xs text-silver-mist">
          {entries.length} decision{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-10 h-10 text-silver-mist mx-auto mb-3" />
          <p className="text-silver-mist">No approval history found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const config = decisionConfig[entry.decision];
            const DecisionIcon = config.icon;

            return (
              <div
                key={entry.id}
                className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <FileText className="w-4 h-4 text-celestial-indigo" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">
                        {entry.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-silver-mist font-medium">
                          {requestTypeLabels[entry.requestType]}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-silver-mist">
                          <User className="w-3 h-3" />
                          {entry.requester}
                        </span>
                        {entry.requesterDepartment && (
                          <span className="text-xs text-silver-mist">
                            {entry.requesterDepartment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`flex items-center gap-1 text-xs font-medium ${config.classes}`}>
                      <DecisionIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                    {entry.decisionDate && (
                      <span className="flex items-center gap-1 text-xs text-silver-mist">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.decisionDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {entry.notes && (
                  <div className="mt-2 pl-7">
                    <p className="text-xs text-ink-black dark:text-pearl italic">
                      &ldquo;{entry.notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
