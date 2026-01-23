"use client";

import React, { useState } from "react";
import { Filter, Calendar, ChevronDown, X } from "lucide-react";

type ApprovalType = "all" | "leave" | "expense" | "timesheet" | "requisition" | "document";
type ApprovalStatus = "all" | "pending" | "approved" | "rejected";

interface ApprovalFiltersState {
  type: ApprovalType;
  status: ApprovalStatus;
  dateFrom: string;
  dateTo: string;
}

interface ApprovalFiltersProps {
  onFilterChange?: (filters: ApprovalFiltersState) => void;
}

const typeOptions: { value: ApprovalType; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "leave", label: "Leave" },
  { value: "expense", label: "Expense" },
  { value: "timesheet", label: "Timesheet" },
  { value: "requisition", label: "Requisition" },
  { value: "document", label: "Document" },
];

const statusOptions: { value: ApprovalStatus; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function ApprovalFilters({ onFilterChange }: ApprovalFiltersProps) {
  const [filters, setFilters] = useState<ApprovalFiltersState>({
    type: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  const handleChange = (field: keyof ApprovalFiltersState, value: string) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const handleClearFilters = () => {
    const cleared: ApprovalFiltersState = {
      type: "all",
      status: "all",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "";

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-celestial-indigo" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
            Filter Approvals
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-xs text-silver-mist hover:text-celestial-indigo transition-colors"
          >
            <X className="w-3 h-3" />
            Clear Filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {/* Type Filter */}
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-silver-mist mb-1.5 block">
            Request Type
          </label>
          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:border-celestial-indigo"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist pointer-events-none" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-silver-mist mb-1.5 block">
            Status
          </label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:border-celestial-indigo"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist pointer-events-none" />
          </div>
        </div>

        {/* Date From */}
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-silver-mist mb-1.5 block">
            Date From
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleChange("dateFrom", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:border-celestial-indigo"
            />
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist pointer-events-none" />
          </div>
        </div>

        {/* Date To */}
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-silver-mist mb-1.5 block">
            Date To
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleChange("dateTo", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:border-celestial-indigo"
            />
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-cloud dark:border-nebula-purple/50">
          {filters.type !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo border border-cloud dark:border-nebula-purple/50">
              Type: {typeOptions.find((o) => o.value === filters.type)?.label}
              <button onClick={() => handleChange("type", "all")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.status !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo border border-cloud dark:border-nebula-purple/50">
              Status: {statusOptions.find((o) => o.value === filters.status)?.label}
              <button onClick={() => handleChange("status", "all")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo border border-cloud dark:border-nebula-purple/50">
              From: {filters.dateFrom}
              <button onClick={() => handleChange("dateFrom", "")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-slate-50 dark:bg-deep-cosmos text-celestial-indigo border border-cloud dark:border-nebula-purple/50">
              To: {filters.dateTo}
              <button onClick={() => handleChange("dateTo", "")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
