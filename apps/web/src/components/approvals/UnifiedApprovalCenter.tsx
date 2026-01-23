"use client";

import React, { useState } from "react";
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

const mockApprovals: ApprovalRequest[] = [
  {
    id: "1",
    type: "leave",
    title: "Annual Leave - 5 days",
    requester: "Sarah Chen",
    requesterRole: "Senior Developer",
    submittedDate: "2026-01-21",
    priority: "medium",
    details: "Feb 10-14, 2026 - Family vacation",
  },
  {
    id: "2",
    type: "expense",
    title: "Conference Travel Expenses",
    requester: "James Wilson",
    requesterRole: "Product Designer",
    submittedDate: "2026-01-20",
    priority: "high",
    details: "React Summit 2026 - Flights, hotel, meals",
    amount: "$2,450.00",
  },
  {
    id: "3",
    type: "timesheet",
    title: "Weekly Timesheet - W3",
    requester: "Maria Rodriguez",
    requesterRole: "QA Engineer",
    submittedDate: "2026-01-19",
    priority: "low",
    details: "Week of Jan 13-17, 2026 - 44 hours logged",
  },
  {
    id: "4",
    type: "requisition",
    title: "Senior Backend Developer",
    requester: "Alex Thompson",
    requesterRole: "Tech Lead",
    submittedDate: "2026-01-18",
    priority: "urgent",
    details: "New hire for API team - Budget approved",
  },
  {
    id: "5",
    type: "document",
    title: "SOW - Client Project Alpha",
    requester: "Priya Patel",
    requesterRole: "Project Manager",
    submittedDate: "2026-01-22",
    priority: "high",
    details: "Statement of Work for new client engagement",
  },
  {
    id: "6",
    type: "expense",
    title: "Software License - Figma",
    requester: "David Kim",
    requesterRole: "UI Designer",
    submittedDate: "2026-01-22",
    priority: "medium",
    details: "Annual Figma professional license renewal",
    amount: "$144.00",
  },
  {
    id: "7",
    type: "leave",
    title: "Sick Leave - 2 days",
    requester: "Priya Patel",
    requesterRole: "DevOps Engineer",
    submittedDate: "2026-01-23",
    priority: "high",
    details: "Jan 27-28, 2026 - Medical appointment",
  },
];

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

export default function UnifiedApprovalCenter() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(mockApprovals);
  const [filterType, setFilterType] = useState<"all" | ApprovalType>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
                <span className="text-xs text-silver-mist">
                  {new Date(approval.submittedDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
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
