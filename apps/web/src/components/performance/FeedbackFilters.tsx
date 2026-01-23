"use client";

import React, { useState } from "react";
import {
  Filter,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
  Calendar,
  EyeOff,
  List,
} from "lucide-react";

export type FeedbackTypeFilter = "all" | "praise" | "constructive" | "suggestion";

export interface FeedbackFiltersState {
  type: FeedbackTypeFilter;
  dateFrom: string;
  dateTo: string;
  anonymousOnly: boolean;
}

interface FilterOption {
  key: FeedbackTypeFilter;
  label: string;
  icon: React.ReactNode;
}

const filterOptions: FilterOption[] = [
  { key: "all", label: "All", icon: <List className="w-4 h-4" /> },
  { key: "praise", label: "Praise", icon: <ThumbsUp className="w-4 h-4" /> },
  {
    key: "constructive",
    label: "Constructive",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  {
    key: "suggestion",
    label: "Suggestion",
    icon: <Lightbulb className="w-4 h-4" />,
  },
];

export function FeedbackFilters() {
  const [filters, setFilters] = useState<FeedbackFiltersState>({
    type: "all",
    dateFrom: "",
    dateTo: "",
    anonymousOnly: false,
  });

  const handleTypeChange = (type: FeedbackTypeFilter) => {
    setFilters((prev) => ({ ...prev, type }));
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, dateFrom: e.target.value }));
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, dateTo: e.target.value }));
  };

  const handleAnonymousToggle = () => {
    setFilters((prev) => ({ ...prev, anonymousOnly: !prev.anonymousOnly }));
  };

  const activeCount = [
    filters.type !== "all",
    filters.dateFrom !== "",
    filters.dateTo !== "",
    filters.anonymousOnly,
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
          Filter Feedback
        </h3>
        {activeCount > 0 && (
          <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-celestial-indigo text-white text-xs font-bold">
            {activeCount}
          </span>
        )}
      </div>

      {/* Type Filter */}
      <div className="mb-4">
        <label className="text-xs font-medium text-silver-mist mb-2 block">
          Type
        </label>
        <div className="flex gap-1 bg-slate-50 dark:bg-deep-cosmos rounded-lg p-1">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handleTypeChange(option.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-1 justify-center ${
                filters.type === option.key
                  ? "bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm border border-cloud dark:border-nebula-purple/50"
                  : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
              }`}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="mb-4">
        <label className="text-xs font-medium text-silver-mist mb-2 block">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Date Range
          </span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={handleDateFromChange}
            className="flex-1 text-xs border border-cloud dark:border-nebula-purple/50 rounded-lg px-3 py-2 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30"
            placeholder="From"
          />
          <span className="text-xs text-silver-mist">to</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={handleDateToChange}
            className="flex-1 text-xs border border-cloud dark:border-nebula-purple/50 rounded-lg px-3 py-2 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30"
            placeholder="To"
          />
        </div>
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-silver-mist flex items-center gap-1.5">
          <EyeOff className="w-3 h-3" />
          Anonymous only
        </label>
        <button
          onClick={handleAnonymousToggle}
          className={`relative w-9 h-5 rounded-full transition-colors ${
            filters.anonymousOnly
              ? "bg-celestial-indigo"
              : "bg-cloud dark:bg-nebula-purple/50"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
              filters.anonymousOnly ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Clear Filters */}
      {activeCount > 0 && (
        <button
          onClick={() =>
            setFilters({
              type: "all",
              dateFrom: "",
              dateTo: "",
              anonymousOnly: false,
            })
          }
          className="mt-4 w-full text-xs text-celestial-indigo font-medium hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
