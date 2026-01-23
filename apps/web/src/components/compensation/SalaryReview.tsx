"use client";

import React, { useState } from "react";
import { DollarSign, TrendingUp, Target, Calendar, FileText } from "lucide-react";

interface SalaryReviewData {
  employeeName: string;
  employeeId: string;
  department: string;
  jobTitle: string;
  currentSalary: number;
  proposedSalary: number;
  compaRatio: number;
  marketMidpoint: number;
  effectiveDate: string;
  justification: string;
}

const mockReviewData: SalaryReviewData = {
  employeeName: "Sarah Chen",
  employeeId: "EMP-2847",
  department: "Engineering",
  jobTitle: "Senior Software Engineer",
  currentSalary: 145000,
  proposedSalary: 158000,
  compaRatio: 1.05,
  marketMidpoint: 150000,
  effectiveDate: "2026-03-01",
  justification: "",
};

export function SalaryReview() {
  const [reviewData, setReviewData] = useState<SalaryReviewData>(mockReviewData);

  const increaseAmount = reviewData.proposedSalary - reviewData.currentSalary;
  const increasePercent = ((increaseAmount / reviewData.currentSalary) * 100).toFixed(1);
  const newCompaRatio = (reviewData.proposedSalary / reviewData.marketMidpoint).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Salary Review</h2>
        <p className="text-sm text-silver-mist mt-1">
          Review and propose salary adjustment for {reviewData.employeeName}.
        </p>
      </div>

      {/* Employee Info */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-silver-mist">Employee</p>
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">{reviewData.employeeName}</p>
          </div>
          <div>
            <p className="text-xs text-silver-mist">ID</p>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">{reviewData.employeeId}</p>
          </div>
          <div>
            <p className="text-xs text-silver-mist">Department</p>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">{reviewData.department}</p>
          </div>
          <div>
            <p className="text-xs text-silver-mist">Title</p>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">{reviewData.jobTitle}</p>
          </div>
        </div>
      </div>

      {/* Salary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Current</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            ${reviewData.currentSalary.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Proposed</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            ${reviewData.proposedSalary.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-silver-mist uppercase font-medium">Increase</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{increasePercent}%</p>
          <p className="text-xs text-silver-mist">+${increaseAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Compa-Ratio</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{newCompaRatio}</p>
          <p className="text-xs text-silver-mist">Market midpoint: ${reviewData.marketMidpoint.toLocaleString()}</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs text-silver-mist mb-1.5">
              <DollarSign className="w-3 h-3" />
              Proposed Salary
            </label>
            <input
              type="number"
              value={reviewData.proposedSalary}
              onChange={(e) => setReviewData({ ...reviewData, proposedSalary: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs text-silver-mist mb-1.5">
              <Calendar className="w-3 h-3" />
              Effective Date
            </label>
            <input
              type="date"
              value={reviewData.effectiveDate}
              onChange={(e) => setReviewData({ ...reviewData, effectiveDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs text-silver-mist mb-1.5">
            <FileText className="w-3 h-3" />
            Justification
          </label>
          <textarea
            value={reviewData.justification}
            onChange={(e) => setReviewData({ ...reviewData, justification: e.target.value })}
            placeholder="Provide reasoning for the proposed salary adjustment..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-sm font-medium text-ink-black dark:text-pearl hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors">
            Save Draft
          </button>
          <button className="px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}
