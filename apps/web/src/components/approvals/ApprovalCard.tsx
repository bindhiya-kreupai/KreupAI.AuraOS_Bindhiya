"use client";

import React, { useState } from "react";
import {
  Check,
  X,
  Calendar,
  User,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type ApprovalPriority = "low" | "medium" | "high" | "urgent";
type ApprovalType = "leave" | "expense" | "timesheet" | "requisition" | "document";

interface ApprovalRequestDetails {
  id: string;
  type: ApprovalType;
  title: string;
  requester: {
    name: string;
    role: string;
    department: string;
    avatar?: string;
  };
  submissionDate: string;
  priority: ApprovalPriority;
  description: string;
  details: Record<string, string>;
  comments: { author: string; text: string; date: string }[];
}

interface ApprovalCardProps {
  request?: ApprovalRequestDetails;
  onApprove?: (id: string, comment: string) => void;
  onReject?: (id: string, comment: string) => void;
}

const defaultRequest: ApprovalRequestDetails = {
  id: "approval-001",
  type: "leave",
  title: "Annual Leave Request - 5 Days",
  requester: {
    name: "Sarah Chen",
    role: "Senior Developer",
    department: "Engineering",
  },
  submissionDate: "2026-01-21",
  priority: "medium",
  description:
    "Requesting annual leave for a family vacation. All current tasks will be completed or handed off before the leave period.",
  details: {
    "Leave Type": "Annual Leave",
    "Start Date": "Feb 10, 2026",
    "End Date": "Feb 14, 2026",
    Duration: "5 working days",
    "Coverage Plan": "James Wilson covering critical tasks",
    "Leave Balance": "12 days remaining",
  },
  comments: [
    {
      author: "Sarah Chen",
      text: "I've already arranged coverage with James for all priority items.",
      date: "2026-01-21",
    },
  ],
};

export default function ApprovalCard({
  request = defaultRequest,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const [comment, setComment] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const priorityConfig: Record<
    ApprovalPriority,
    { label: string; className: string }
  > = {
    low: { label: "Low", className: "bg-silver-mist/20 text-silver-mist" },
    medium: {
      label: "Medium",
      className: "bg-celestial-indigo/10 text-celestial-indigo",
    },
    high: { label: "High", className: "bg-coral-alert/10 text-coral-alert" },
    urgent: {
      label: "Urgent",
      className: "bg-coral-alert/20 text-coral-alert font-bold",
    },
  };

  const typeLabels: Record<ApprovalType, string> = {
    leave: "Leave Request",
    expense: "Expense Report",
    timesheet: "Timesheet",
    requisition: "Requisition",
    document: "Document",
  };

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onApprove?.(request.id, comment);
      setIsProcessing(false);
    }, 500);
  };

  const handleReject = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onReject?.(request.id, comment);
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-cloud dark:border-nebula-purple/50">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-silver-mist uppercase tracking-wider">
                {typeLabels[request.type]}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityConfig[request.priority].className}`}
              >
                {priorityConfig[request.priority].label}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
              {request.title}
            </h3>
          </div>
          <span className="text-xs text-silver-mist">#{request.id}</span>
        </div>

        {/* Requester Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
            <User className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">
              {request.requester.name}
            </p>
            <p className="text-xs text-silver-mist">
              {request.requester.role} | {request.requester.department}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Calendar className="w-3 h-3 text-silver-mist" />
            <span className="text-xs text-silver-mist">
              Submitted{" "}
              {new Date(request.submissionDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-5 border-b border-cloud dark:border-nebula-purple/50">
        <p className="text-sm text-ink-black dark:text-pearl">{request.description}</p>
      </div>

      {/* Request Details */}
      <div className="border-b border-cloud dark:border-nebula-purple/50">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-ink-black dark:text-pearl hover:bg-cloud/20 dark:hover:bg-nebula-purple/10 transition-colors"
        >
          <span>Request Details</span>
          {showDetails ? (
            <ChevronUp className="w-4 h-4 text-silver-mist" />
          ) : (
            <ChevronDown className="w-4 h-4 text-silver-mist" />
          )}
        </button>
        {showDetails && (
          <div className="px-5 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(request.details).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-silver-mist mb-0.5">{key}</p>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments */}
      {request.comments.length > 0 && (
        <div className="p-5 border-b border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-silver-mist" />
            <span className="text-xs font-medium text-silver-mist">
              Comments ({request.comments.length})
            </span>
          </div>
          <div className="space-y-2">
            {request.comments.map((c, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-ink-black dark:text-pearl">
                    {c.author}
                  </span>
                  <span className="text-xs text-silver-mist">
                    {new Date(c.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-ink-black dark:text-pearl">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Section */}
      <div className="p-5">
        <div className="mb-4">
          <label className="text-xs font-medium text-silver-mist mb-1.5 block">
            Add a comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Add your comment or reason..."
            className="w-full px-3 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-aurora-green rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-coral-alert border border-coral-alert/30 rounded-lg hover:bg-coral-alert/10 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
          <div className="ml-auto flex items-center gap-1 text-xs text-silver-mist">
            <AlertCircle className="w-3 h-3" />
            <span>This action cannot be undone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
