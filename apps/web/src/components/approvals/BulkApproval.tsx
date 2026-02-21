"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Square,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  MinusSquare,
} from "lucide-react";

type ApprovalType = "leave" | "expense" | "timesheet" | "requisition" | "document";

interface BulkApprovalItem {
  id: string;
  type: ApprovalType;
  title: string;
  requester: string;
  submittedDate: string;
  amount?: string;
}

const typeBadgeColors: Record<ApprovalType, string> = {
  leave: "bg-aurora-green/10 text-aurora-green",
  expense: "bg-celestial-indigo/10 text-celestial-indigo",
  timesheet: "bg-silver-mist/20 text-silver-mist",
  requisition: "bg-coral-alert/10 text-coral-alert",
  document: "bg-celestial-indigo/10 text-celestial-indigo",
};

export default function BulkApproval() {
  const [items, setItems] = useState<BulkApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkComment, setBulkComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    async function fetchPendingItems() {
      setLoading(true);
      setError(null);
      try {
        const [leaveRes, expenseRes, timesheetRes, requisitionRes] = await Promise.allSettled([
          fetch('/api/v1/leave/apply').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/compensation/expense-claims?status=PENDING').then(r => r.json()).catch(() => null),
          fetch('/api/attendance/timesheets?status=PENDING').then(r => r.json()).catch(() => null),
          fetch('/api/recruitment/requisitions?status=Pending').then(r => r.json()).catch(() => null),
        ]);

        const bulkItems: BulkApprovalItem[] = [];

        if (leaveRes.status === 'fulfilled' && leaveRes.value?.success) {
          const pendingLeaves = (leaveRes.value.data || []).filter(
            (r: Record<string, unknown>) => r.status === 'PENDING'
          );
          bulkItems.push(...pendingLeaves.map((l: Record<string, unknown>) => ({
            id: `leave-${l.id}`,
            type: 'leave' as ApprovalType,
            title: `Leave Request - ${l.totalDays || '?'} day(s)`,
            requester: (l.employeeName as string) || (l.employeeId as string) || 'Employee',
            submittedDate: (l.startDate as string) || (l.createdAt as string) || '',
          })));
        }

        if (expenseRes.status === 'fulfilled' && expenseRes.value?.success) {
          bulkItems.push(...(expenseRes.value.data || []).map((e: Record<string, unknown>) => ({
            id: `expense-${e.id}`,
            type: 'expense' as ApprovalType,
            title: (e.title as string) || 'Expense Claim',
            requester: (e.employeeName as string) || (e.employeeId as string) || 'Employee',
            submittedDate: (e.date as string) || (e.createdAt as string) || '',
            amount: e.amount ? `${e.currency || '$'}${Number(e.amount).toLocaleString()}` : undefined,
          })));
        }

        if (timesheetRes.status === 'fulfilled' && timesheetRes.value?.success) {
          const pendingTs = (timesheetRes.value.data || []).filter(
            (t: Record<string, unknown>) => t.status === 'PENDING'
          );
          bulkItems.push(...pendingTs.map((t: Record<string, unknown>) => ({
            id: `timesheet-${t.id}`,
            type: 'timesheet' as ApprovalType,
            title: `Weekly Timesheet - ${t.weekEnding || ''}`,
            requester: (t.employeeName as string) || (t.employeeId as string) || 'Employee',
            submittedDate: (t.weekEnding as string) || '',
          })));
        }

        if (requisitionRes.status === 'fulfilled' && requisitionRes.value?.success) {
          const pendingReqs = (requisitionRes.value.data || []).filter(
            (r: Record<string, unknown>) => r.approvalStatus === 'Pending'
          );
          bulkItems.push(...pendingReqs.map((r: Record<string, unknown>) => ({
            id: `requisition-${r.id}`,
            type: 'requisition' as ApprovalType,
            title: (r.jobTitle as string) || 'Job Requisition',
            requester: (r.requestedBy as string) || 'Manager',
            submittedDate: (r.requestedDate as string) || (r.createdAt as string) || '',
          })));
        }

        setItems(bulkItems);
      } catch (err) {
        console.error('Failed to fetch bulk approval items:', err);
        setError('Failed to load pending items for bulk approval.');
      } finally {
        setLoading(false);
      }
    }

    fetchPendingItems();
  }, []);

  const allSelected = selectedIds.size === items.length && items.length > 0;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = (type: "approve" | "reject") => {
    setActionType(type);
    setShowCommentBox(true);
  };

  const confirmBulkAction = () => {
    if (actionType) {
      console.log(`Bulk ${actionType}:`, Array.from(selectedIds), "Comment:", bulkComment);
      setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
      setBulkComment("");
      setShowCommentBox(false);
      setActionType(null);
    }
  };

  const cancelBulkAction = () => {
    setShowCommentBox(false);
    setBulkComment("");
    setActionType(null);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40" />
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
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
      <div className="flex items-center gap-3 mb-6">
        <CheckSquare className="w-6 h-6 text-celestial-indigo" />
        <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
          Bulk Approval
        </h2>
      </div>

      {/* Bulk Actions Bar */}
      <div className="flex items-center justify-between p-3 mb-4 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10 border border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm text-ink-black dark:text-pearl hover:text-celestial-indigo transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-5 h-5 text-celestial-indigo" />
            ) : someSelected ? (
              <MinusSquare className="w-5 h-5 text-celestial-indigo" />
            ) : (
              <Square className="w-5 h-5 text-silver-mist" />
            )}
            <span className="font-medium">
              {selectedIds.size > 0
                ? `${selectedIds.size} of ${items.length} selected`
                : "Select All"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBulkAction("approve")}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-aurora-green rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Approve Selected
          </button>
          <button
            onClick={() => handleBulkAction("reject")}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-coral-alert border border-coral-alert/30 rounded-lg hover:bg-coral-alert/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            Reject Selected
          </button>
        </div>
      </div>

      {/* Comment Box for Bulk Actions */}
      {showCommentBox && (
        <div className="mb-4 p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-cloud/10 dark:bg-nebula-purple/5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-silver-mist" />
            <span className="text-sm font-medium text-ink-black dark:text-pearl">
              {actionType === "approve" ? "Approve" : "Reject"} {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""}
            </span>
          </div>
          <textarea
            value={bulkComment}
            onChange={(e) => setBulkComment(e.target.value)}
            rows={3}
            placeholder={`Add a comment for the bulk ${actionType} action (optional)...`}
            className="w-full px-3 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 resize-none mb-3"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={confirmBulkAction}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity ${
                actionType === "approve" ? "bg-aurora-green" : "bg-coral-alert"
              }`}
            >
              <Check className="w-4 h-4" />
              Confirm {actionType === "approve" ? "Approval" : "Rejection"}
            </button>
            <button
              onClick={cancelBulkAction}
              className="px-4 py-2 text-sm font-medium text-silver-mist border border-cloud dark:border-nebula-purple/50 rounded-lg hover:text-ink-black dark:hover:text-pearl transition-colors"
            >
              Cancel
            </button>
            <div className="ml-auto flex items-center gap-1 text-xs text-silver-mist">
              <AlertCircle className="w-3 h-3" />
              <span>This action cannot be undone</span>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item) => {
          const isSelected = selectedIds.has(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                  ? "border-celestial-indigo/50 bg-celestial-indigo/5"
                  : "border-cloud dark:border-nebula-purple/50 hover:bg-cloud/20 dark:hover:bg-nebula-purple/10"
              }`}
            >
              {/* Checkbox */}
              <div className="flex-shrink-0">
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-celestial-indigo" />
                ) : (
                  <Square className="w-5 h-5 text-silver-mist" />
                )}
              </div>

              {/* Type Badge */}
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${typeBadgeColors[item.type]}`}
              >
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-silver-mist">{item.requester}</span>
                  {item.submittedDate && (
                    <span className="text-xs text-silver-mist">
                      {new Date(item.submittedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Amount if applicable */}
              {item.amount && (
                <span className="text-sm font-medium text-celestial-indigo flex-shrink-0">
                  {item.amount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-10 h-10 text-silver-mist mx-auto mb-3" />
          <p className="text-silver-mist">All approvals have been processed.</p>
        </div>
      )}
    </div>
  );
}
