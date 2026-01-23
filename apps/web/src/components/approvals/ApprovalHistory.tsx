"use client";

import React from "react";
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

const mockHistory: ApprovalHistoryEntry[] = [
  {
    id: "hist-001",
    requestType: "leave",
    title: "Annual Leave - 3 Days",
    requester: "Sarah Chen",
    requesterDepartment: "Engineering",
    decision: "approved",
    decisionDate: "2026-01-20",
    notes: "Coverage plan confirmed with team lead.",
  },
  {
    id: "hist-002",
    requestType: "expense",
    title: "Conference Travel Expenses",
    requester: "James Wilson",
    requesterDepartment: "Marketing",
    decision: "approved",
    decisionDate: "2026-01-18",
    notes: "Within budget allocation for Q1.",
  },
  {
    id: "hist-003",
    requestType: "requisition",
    title: "New Laptop - Development Team",
    requester: "Michael Roberts",
    requesterDepartment: "Engineering",
    decision: "rejected",
    decisionDate: "2026-01-17",
    notes: "Budget exceeded for this quarter. Please resubmit in Q2.",
  },
  {
    id: "hist-004",
    requestType: "timesheet",
    title: "Overtime Hours - Week 2",
    requester: "Lisa Park",
    requesterDepartment: "Operations",
    decision: "approved",
    decisionDate: "2026-01-15",
    notes: "Verified with project manager.",
  },
  {
    id: "hist-005",
    requestType: "document",
    title: "Policy Update Review",
    requester: "Anna Martinez",
    requesterDepartment: "HR",
    decision: "rejected",
    decisionDate: "2026-01-14",
    notes: "Requires legal review before approval. Please attach legal sign-off.",
  },
];

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

export function ApprovalHistory({ entries = mockHistory }: ApprovalHistoryProps) {
  return (
    <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-2 mb-5">
        <History className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
          Approval History
        </h3>
        <span className="ml-auto text-xs text-silver-mist">
          {entries.length} decisions
        </span>
      </div>

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
                      <span className="text-xs text-silver-mist">
                        {entry.requesterDepartment}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`flex items-center gap-1 text-xs font-medium ${config.classes}`}>
                    <DecisionIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-silver-mist">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.decisionDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
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
    </div>
  );
}
