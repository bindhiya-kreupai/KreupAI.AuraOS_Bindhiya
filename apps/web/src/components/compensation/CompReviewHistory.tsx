"use client";

import React, { useState } from "react";
import { History, ArrowUpRight, Filter, Search } from "lucide-react";

interface CompReview {
  id: string;
  effectiveDate: string;
  previousSalary: number;
  newSalary: number;
  changePercent: number;
  approver: string;
  reason: string;
  type: "Merit" | "Promotion" | "Market Adjustment" | "Equity" | "Annual Review";
}

const mockHistory: CompReview[] = [
  {
    id: "1",
    effectiveDate: "2026-01-01",
    previousSalary: 145000,
    newSalary: 158000,
    changePercent: 8.97,
    approver: "Michael Torres",
    reason: "Promotion to Senior Engineer - exceptional performance and leadership growth",
    type: "Promotion",
  },
  {
    id: "2",
    effectiveDate: "2025-04-01",
    previousSalary: 138000,
    newSalary: 145000,
    changePercent: 5.07,
    approver: "Michael Torres",
    reason: "Annual merit increase - exceeded expectations on all key deliverables",
    type: "Merit",
  },
  {
    id: "3",
    effectiveDate: "2024-07-01",
    previousSalary: 130000,
    newSalary: 138000,
    changePercent: 6.15,
    approver: "Lisa Park",
    reason: "Market adjustment to align with competitive benchmark data",
    type: "Market Adjustment",
  },
  {
    id: "4",
    effectiveDate: "2024-01-01",
    previousSalary: 125000,
    newSalary: 130000,
    changePercent: 4.0,
    approver: "Lisa Park",
    reason: "Annual review - meets expectations with consistent solid performance",
    type: "Annual Review",
  },
  {
    id: "5",
    effectiveDate: "2023-03-01",
    previousSalary: 115000,
    newSalary: 125000,
    changePercent: 8.7,
    approver: "Lisa Park",
    reason: "Equity adjustment - internal pay parity alignment",
    type: "Equity",
  },
];

const typeColors: Record<string, string> = {
  "Merit": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  "Promotion": "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  "Market Adjustment": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  "Equity": "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  "Annual Review": "bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300",
};

export function CompReviewHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("All");

  const filteredHistory = mockHistory.filter((review) => {
    const matchesSearch =
      review.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.approver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || review.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalIncrease = mockHistory.length > 0
    ? mockHistory[mockHistory.length - 1].previousSalary
      ? ((mockHistory[0].newSalary - mockHistory[mockHistory.length - 1].previousSalary) /
          mockHistory[mockHistory.length - 1].previousSalary) *
        100
      : 0
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Compensation Review History</h2>
        <p className="text-sm text-silver-mist mt-1">Track past compensation changes and adjustments.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Reviews</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{mockHistory.length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Growth</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{totalIncrease.toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Current Salary</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            ${mockHistory[0].newSalary.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reason or approver..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-silver-mist" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
          >
            <option>All</option>
            <option>Merit</option>
            <option>Promotion</option>
            <option>Market Adjustment</option>
            <option>Equity</option>
            <option>Annual Review</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-deep-cosmos">
                <th className="text-left text-xs font-medium text-silver-mist px-4 py-3">Effective Date</th>
                <th className="text-left text-xs font-medium text-silver-mist px-4 py-3">Type</th>
                <th className="text-right text-xs font-medium text-silver-mist px-4 py-3">Old Salary</th>
                <th className="text-right text-xs font-medium text-silver-mist px-4 py-3">New Salary</th>
                <th className="text-right text-xs font-medium text-silver-mist px-4 py-3">Change %</th>
                <th className="text-left text-xs font-medium text-silver-mist px-4 py-3">Approver</th>
                <th className="text-left text-xs font-medium text-silver-mist px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud dark:divide-nebula-purple/50">
              {filteredHistory.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50/50 dark:hover:bg-deep-cosmos/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-ink-black dark:text-pearl whitespace-nowrap">
                    {new Date(review.effectiveDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[review.type]}`}>
                      {review.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-silver-mist">
                    ${review.previousSalary.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-ink-black dark:text-pearl">
                    ${review.newSalary.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-600 dark:text-green-400">
                    +{review.changePercent.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-black dark:text-pearl whitespace-nowrap">
                    {review.approver}
                  </td>
                  <td className="px-4 py-3 text-xs text-silver-mist max-w-[200px] truncate">
                    {review.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
