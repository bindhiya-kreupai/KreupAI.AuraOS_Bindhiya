"use client";

import React from "react";
import { Shield, AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";

type CheckStatus = "completed" | "in_progress" | "pending" | "failed";

interface BackgroundCheck {
  id: string;
  type: string;
  description: string;
  status: CheckStatus;
  completedDate?: string;
  notes?: string;
}

interface BackgroundCheckData {
  candidateName: string;
  position: string;
  initiatedDate: string;
  overallStatus: string;
  checks: BackgroundCheck[];
}

const mockData: BackgroundCheckData = {
  candidateName: "Sarah Johnson",
  position: "Senior Full-Stack Engineer",
  initiatedDate: "Jan 18, 2026",
  overallStatus: "In Progress",
  checks: [
    {
      id: "1",
      type: "Criminal Record",
      description: "National and county criminal records search",
      status: "completed",
      completedDate: "Jan 20, 2026",
      notes: "No records found",
    },
    {
      id: "2",
      type: "Employment Verification",
      description: "Verification of past 3 employers",
      status: "completed",
      completedDate: "Jan 21, 2026",
      notes: "All verified successfully",
    },
    {
      id: "3",
      type: "Education Verification",
      description: "Degree and institution verification",
      status: "in_progress",
      notes: "Awaiting response from Stanford University",
    },
    {
      id: "4",
      type: "Credit Check",
      description: "Credit history and financial background",
      status: "pending",
    },
  ],
};

const statusConfig: Record<CheckStatus, { icon: typeof CheckCircle; label: string; classes: string }> = {
  completed: {
    icon: CheckCircle,
    label: "Completed",
    classes: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  in_progress: {
    icon: RefreshCw,
    label: "In Progress",
    classes: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    classes: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    classes: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  },
};

export default function BackgroundCheckPortal() {
  const { candidateName, position, initiatedDate, overallStatus, checks } = mockData;
  const completedCount = checks.filter((c) => c.status === "completed").length;

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-celestial-indigo" />
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Background Check Portal</h2>
      </div>

      {/* Summary Header */}
      <div className="mb-6 p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">{candidateName}</p>
            <p className="text-xs text-silver-mist">{position}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
            {overallStatus}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-silver-mist">
          <span>Initiated: {initiatedDate}</span>
          <span>{completedCount}/{checks.length} checks completed</span>
        </div>
        {/* Progress Bar */}
        <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-celestial-indigo transition-all"
            style={{ width: `${(completedCount / checks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Check List */}
      <div className="space-y-3">
        {checks.map((check) => {
          const config = statusConfig[check.status];
          const StatusIcon = config.icon;
          return (
            <div
              key={check.id}
              className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-celestial-indigo" />
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{check.type}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-silver-mist mb-1">{check.description}</p>
              {check.completedDate && (
                <p className="text-xs text-silver-mist">Completed: {check.completedDate}</p>
              )}
              {check.notes && (
                <p className="text-xs text-ink-black dark:text-pearl mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-silver-mist" />
                  {check.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
