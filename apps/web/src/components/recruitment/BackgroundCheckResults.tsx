"use client";

import React, { useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
} from "lucide-react";

type CheckCategory = "criminal" | "education" | "employment" | "credit";
type CheckResult = "pass" | "fail" | "pending";

interface CheckFinding {
  detail: string;
  date: string;
  source: string;
}

interface BackgroundCheckCategory {
  id: string;
  category: CheckCategory;
  label: string;
  result: CheckResult;
  completedDate?: string;
  findings: CheckFinding[];
  summary: string;
}

interface BackgroundCheckResultsProps {
  candidateName?: string;
  position?: string;
  categories?: BackgroundCheckCategory[];
}

const categoryLabels: Record<CheckCategory, string> = {
  criminal: "Criminal Record",
  education: "Education Verification",
  employment: "Employment History",
  credit: "Credit Check",
};

const resultConfig: Record<CheckResult, { icon: typeof CheckCircle; label: string; badgeClasses: string; iconClasses: string }> = {
  pass: {
    icon: CheckCircle,
    label: "Pass",
    badgeClasses: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    iconClasses: "text-green-600 dark:text-green-400",
  },
  fail: {
    icon: XCircle,
    label: "Fail",
    badgeClasses: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    iconClasses: "text-red-500 dark:text-red-400",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    badgeClasses: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    iconClasses: "text-yellow-600 dark:text-yellow-400",
  },
};

const mockCategories: BackgroundCheckCategory[] = [
  {
    id: "cat-1",
    category: "criminal",
    label: "Criminal Record Check",
    result: "pass",
    completedDate: "2026-01-19",
    summary: "No criminal records found across all jurisdictions searched.",
    findings: [
      {
        detail: "National criminal database - No records found",
        date: "2026-01-18",
        source: "National Crime Information Center",
      },
      {
        detail: "County-level search (3 counties) - Clear",
        date: "2026-01-19",
        source: "County Court Records",
      },
      {
        detail: "Sex offender registry - Not listed",
        date: "2026-01-18",
        source: "National Sex Offender Registry",
      },
    ],
  },
  {
    id: "cat-2",
    category: "education",
    label: "Education Verification",
    result: "pass",
    completedDate: "2026-01-20",
    summary: "All claimed educational credentials have been verified.",
    findings: [
      {
        detail: "B.S. Computer Science - Stanford University (2018) - Verified",
        date: "2026-01-20",
        source: "National Student Clearinghouse",
      },
      {
        detail: "M.S. Data Science - MIT (2020) - Verified",
        date: "2026-01-20",
        source: "MIT Registrar Office",
      },
    ],
  },
  {
    id: "cat-3",
    category: "employment",
    label: "Employment History Verification",
    result: "fail",
    completedDate: "2026-01-21",
    summary: "Discrepancy found in employment dates for one previous employer.",
    findings: [
      {
        detail: "TechCorp Inc. (2020-2023) - Verified, dates match",
        date: "2026-01-20",
        source: "TechCorp HR Department",
      },
      {
        detail: "StartupXYZ (2018-2020) - Discrepancy: Actual dates were Jun 2019 - Dec 2020, not Jan 2018 - Dec 2020 as claimed",
        date: "2026-01-21",
        source: "StartupXYZ Former Manager",
      },
      {
        detail: "FreelanceWork (2017-2018) - Unable to verify, no company records found",
        date: "2026-01-21",
        source: "Independent Research",
      },
    ],
  },
  {
    id: "cat-4",
    category: "credit",
    label: "Credit Check",
    result: "pending",
    summary: "Credit check is currently being processed.",
    findings: [],
  },
];

export function BackgroundCheckResults({
  candidateName = "Sarah Johnson",
  position = "Senior Full-Stack Engineer",
  categories = mockCategories,
}: BackgroundCheckResultsProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const passCount = categories.filter((c) => c.result === "pass").length;
  const failCount = categories.filter((c) => c.result === "fail").length;
  const pendingCount = categories.filter((c) => c.result === "pending").length;

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Shield className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
          Background Check Results
        </h3>
      </div>

      {/* Candidate Info */}
      <div className="mb-5 p-4 rounded-lg bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">{candidateName}</p>
            <p className="text-xs text-silver-mist">{position}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="w-3.5 h-3.5" /> {passCount} Pass
            </span>
            <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
              <XCircle className="w-3.5 h-3.5" /> {failCount} Fail
            </span>
            <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
              <Clock className="w-3.5 h-3.5" /> {pendingCount} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const config = resultConfig[cat.result];
          const ResultIcon = config.icon;
          const isExpanded = expandedCategories.has(cat.id);

          return (
            <div
              key={cat.id}
              className="rounded-lg border border-cloud dark:border-nebula-purple/50 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ResultIcon className={`w-5 h-5 ${config.iconClasses}`} />
                  <div>
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {cat.label}
                    </p>
                    <p className="text-xs text-silver-mist mt-0.5">{cat.summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.badgeClasses}`}>
                    {config.label}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-silver-mist" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-silver-mist" />
                  )}
                </div>
              </button>

              {/* Expanded Findings */}
              {isExpanded && (
                <div className="border-t border-cloud dark:border-nebula-purple/50 p-4 bg-slate-50 dark:bg-deep-cosmos">
                  {cat.completedDate && (
                    <p className="text-xs text-silver-mist mb-3">
                      Completed: {new Date(cat.completedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  {cat.findings.length > 0 ? (
                    <div className="space-y-2">
                      {cat.findings.map((finding, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-3 rounded-lg bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50"
                        >
                          <FileText className="w-3.5 h-3.5 text-celestial-indigo mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-ink-black dark:text-pearl">
                              {finding.detail}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-silver-mist">{finding.date}</span>
                              <span className="text-xs text-silver-mist">Source: {finding.source}</span>
                            </div>
                          </div>
                          {finding.detail.toLowerCase().includes("discrepancy") || finding.detail.toLowerCase().includes("unable") ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-silver-mist italic">
                      No findings available yet. Check is still in progress.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
