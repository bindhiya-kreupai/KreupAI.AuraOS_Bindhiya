"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Users,
  Check,
  X,
  Filter,
  Search,
} from "lucide-react";

type ApprovalType = "leave" | "expense" | "timesheet" | "requisition" | "document";
type ApprovalPriority = "low" | "medium" | "high" | "urgent";

interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  requester: string;
  requesterRole: string;
  submittedDate: string;
  priority: ApprovalPriority;
  details: string;
  amount?: string;
}

const typeIcons: Record<ApprovalType, React.ReactNode> = {
  leave: <Calendar className="w-4 h-4" />,
  expense: <DollarSign className="w-4 h-4" />,
  timesheet: <Clock className="w-4 h-4" />,
  requisition: <Users className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
};

const typeColors: Record<ApprovalType, string> = {
  leave: "bg-aurora-green/10 text-aurora-green",
  expense: "bg-celestial-indigo/10 text-celestial-indigo",
  timesheet: "bg-silver-mist/20 text-silver-mist",
  requisition: "bg-coral-alert/10 text-coral-alert",
  document: "bg-celestial-indigo/10 text-celestial-indigo",
};

const priorityColors: Record<ApprovalPriority, string> = {
  low: "text-silver-mist",
  medium: "text-celestial-indigo",
  high: "text-coral-alert",
  urgent: "text-coral-alert font-bold",
};

function mapLeaveToApproval(leave: Record<string, unknown>): ApprovalRequest {
  return {
    id: `leave-${leave.id}`,
    type: "leave",
    title: `Leave Request - ${leave.totalDays || '?'} day(s)`,
    requester: (leave.employeeName as string) || (leave.employeeId as string) || "Employee",
    requesterRole: "",
    submittedDate: (leave.startDate as string) || (leave.createdAt as string) || "",
    priority: "medium",
    details: (leave.reason as string) || "Leave request pending approval",
  };
}

function mapExpenseToApproval(expense: Record<string, unknown>): ApprovalRequest {
  return {
    id: `expense-${expense.id}`,
    type: "expense",
    title: (expense.title as string) || "Expense Claim",
    requester: (expense.employeeName as string) || (expense.employeeId as string) || "Employee",
    requesterRole: "",
    submittedDate: (expense.date as string) || (expense.createdAt as string) || "",
    priority: "medium",
    details: (expense.description as string) || (expense.category as string) || "Expense claim pending",
    amount: expense.amount ? `${expense.currency || '$'}${Number(expense.amount).toLocaleString()}` : undefined,
  };
}

function mapTimesheetToApproval(ts: Record<string, unknown>): ApprovalRequest {
  return {
    id: `timesheet-${ts.id}`,
    type: "timesheet",
    title: `Weekly Timesheet - ${ts.weekEnding || ''}`,
    requester: (ts.employeeName as string) || (ts.employeeId as string) || "Employee",
    requesterRole: "",
    submittedDate: (ts.weekEnding as string) || "",
    priority: "low",
    details: `${ts.totalHours || 0} hours logged (${ts.regularHours || 0} regular, ${ts.overtimeHours || 0} overtime)`,
  };
}

function mapRequisitionToApproval(req: Record<string, unknown>): ApprovalRequest {
  return {
    id: `requisition-${req.id}`,
    type: "requisition",
    title: (req.jobTitle as string) || "Job Requisition",
    requester: (req.requestedBy as string) || "Manager",
    requesterRole: "",
    submittedDate: (req.requestedDate as string) || (req.createdAt as string) || "",
    priority: (req.priority as string)?.toLowerCase() === "high" ? "urgent" : "medium",
    details: `${req.department || ''} - ${req.numberOfPositions || 1} position(s)`,
  };
}

export default function UnifiedApprovalCenter() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | ApprovalType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchApprovals() {
      setLoading(true);
      setError(null);
      try {
        const [leaveRes, expenseRes, timesheetRes, requisitionRes] = await Promise.allSettled([
          fetch('/api/v1/leave/apply').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/compensation/expense-claims?status=PENDING').then(r => r.json()).catch(() => null),
          fetch('/api/attendance/timesheets?status=PENDING').then(r => r.json()).catch(() => null),
          fetch('/api/recruitment/requisitions?status=Pending').then(r => r.json()).catch(() => null),
        ]);

        const items: ApprovalRequest[] = [];

        if (leaveRes.status === 'fulfilled' && leaveRes.value?.success) {
          const pendingLeaves = (leaveRes.value.data || []).filter(
            (r: Record<string, unknown>) => r.status === 'PENDING'
          );
          items.push(...pendingLeaves.map(mapLeaveToApproval));
        }

        if (expenseRes.status === 'fulfilled' && expenseRes.value?.success) {
          items.push(...(expenseRes.value.data || []).map(mapExpenseToApproval));
        }

        if (timesheetRes.status === 'fulfilled' && timesheetRes.value?.success) {
          const pendingTs = (timesheetRes.value.data || []).filter(
            (t: Record<string, unknown>) => t.status === 'PENDING'
          );
          items.push(...pendingTs.map(mapTimesheetToApproval));
        }

        if (requisitionRes.status === 'fulfilled' && requisitionRes.value?.success) {
          const pendingReqs = (requisitionRes.value.data || []).filter(
            (r: Record<string, unknown>) => r.approvalStatus === 'Pending'
          );
          items.push(...pendingReqs.map(mapRequisitionToApproval));
        }

        setApprovals(items);
      } catch (err) {
        console.error('Failed to fetch approvals:', err);
        setError('Failed to load pending approvals.');
      } finally {
        setLoading(false);
      }
    }

    fetchApprovals();
  }, []);

  const handleApprove = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const handleReject = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredApprovals = approvals.filter((approval) => {
    const matchesType = filterType === "all" || approval.type === filterType;
    const matchesSearch =
      approval.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requester.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const typeCounts = {
    all: approvals.length,
    leave: approvals.filter((a) => a.type === "leave").length,
    expense: approvals.filter((a) => a.type === "expense").length,
    timesheet: approvals.filter((a) => a.type === "timesheet").length,
    requisition: approvals.filter((a) => a.type === "requisition").length,
    document: approvals.filter((a) => a.type === "document").length,
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30 text-center">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-6 h-6 text-celestial-indigo" />
          <div>
            <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
              Unified Approval Center
            </h2>
            <p className="text-xs text-silver-mist">
              {approvals.length} pending approval{approvals.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            placeholder="Search approvals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="w-4 h-4 text-silver-mist mr-1" />
          {(["all", "leave", "expense", "timesheet", "requisition", "document"] as const).map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterType === type
                    ? "bg-celestial-indigo text-white"
                    : "bg-cloud/50 dark:bg-nebula-purple/10 text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20"
                }`}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                {typeCounts[type] > 0 && (
                  <span className="ml-1 opacity-75">({typeCounts[type]})</span>
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {filteredApprovals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud/20 dark:hover:bg-nebula-purple/10 transition-colors"
          >
            {/* Type Badge */}
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg ${typeColors[approval.type]}`}
            >
              {typeIcons[approval.type]}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                  {approval.title}
                </p>
                <span
                  className={`text-xs ${priorityColors[approval.priority]}`}
                >
                  {approval.priority === "urgent" ? "URGENT" : approval.priority}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-silver-mist">{approval.requester}</span>
                {approval.submittedDate && (
                  <span className="text-xs text-silver-mist">
                    {new Date(approval.submittedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
                {approval.amount && (
                  <span className="text-xs font-medium text-celestial-indigo">
                    {approval.amount}
                  </span>
                )}
              </div>
              <p className="text-xs text-silver-mist mt-1 truncate">{approval.details}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleApprove(approval.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-aurora-green rounded-lg hover:opacity-90 transition-opacity"
              >
                <Check className="w-3 h-3" />
                Approve
              </button>
              <button
                onClick={() => handleReject(approval.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-coral-alert border border-coral-alert/30 rounded-lg hover:bg-coral-alert/10 transition-colors"
              >
                <X className="w-3 h-3" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredApprovals.length === 0 && (
        <div className="text-center py-12">
          <ClipboardCheck className="w-10 h-10 text-silver-mist mx-auto mb-3" />
          <p className="text-silver-mist">No pending approvals found.</p>
        </div>
      )}
    </div>
  );
}
