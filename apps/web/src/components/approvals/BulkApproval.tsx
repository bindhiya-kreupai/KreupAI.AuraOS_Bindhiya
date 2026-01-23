"use client";

import React, { useState } from "react";
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

const mockItems: BulkApprovalItem[] = [
  {
    id: "1",
    type: "leave",
    title: "Annual Leave - 5 days",
    requester: "Sarah Chen",
    submittedDate: "2026-01-21",
  },
  {
    id: "2",
    type: "expense",
    title: "Conference Travel Expenses",
    requester: "James Wilson",
    submittedDate: "2026-01-20",
    amount: "$2,450.00",
  },
  {
    id: "3",
    type: "timesheet",
    title: "Weekly Timesheet - W3",
    requester: "Maria Rodriguez",
    submittedDate: "2026-01-19",
  },
  {
    id: "4",
    type: "requisition",
    title: "Senior Backend Developer",
    requester: "Alex Thompson",
    submittedDate: "2026-01-18",
  },
  {
    id: "5",
    type: "document",
    title: "SOW - Client Project Alpha",
    requester: "Priya Patel",
    submittedDate: "2026-01-22",
  },
  {
    id: "6",
    type: "expense",
    title: "Software License - Figma",
    requester: "David Kim",
    submittedDate: "2026-01-22",
    amount: "$144.00",
  },
  {
    id: "7",
    type: "leave",
    title: "Sick Leave - 2 days",
    requester: "Priya Patel",
    submittedDate: "2026-01-23",
  },
];

const typeBadgeColors: Record<ApprovalType, string> = {
  leave: "bg-aurora-green/10 text-aurora-green",
  expense: "bg-celestial-indigo/10 text-celestial-indigo",
  timesheet: "bg-silver-mist/20 text-silver-mist",
  requisition: "bg-coral-alert/10 text-coral-alert",
  document: "bg-celestial-indigo/10 text-celestial-indigo",
};

export default function BulkApproval() {
  const [items, setItems] = useState<BulkApprovalItem[]>(mockItems);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkComment, setBulkComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

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
                  <span className="text-xs text-silver-mist">
                    {new Date(item.submittedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
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
