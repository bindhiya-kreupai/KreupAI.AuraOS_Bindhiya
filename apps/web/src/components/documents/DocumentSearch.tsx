"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Filter, ChevronDown } from "lucide-react";

interface SearchFilters {
  types: string[];
  dateRange: string | null;
  category: string | null;
}

interface DocumentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const fileTypes = [
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Image" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "document", label: "Document" },
];

const dateRanges = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

const categoryOptions = [
  "Personal",
  "Tax",
  "Employment",
  "Benefits",
  "Training",
];

export default function DocumentSearch({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFiltersChange,
}: DocumentSearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      onSearchChange(localQuery);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localQuery, onSearchChange]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTypeFilter = (type: string) => {
    const newTypes = activeFilters.types.includes(type)
      ? activeFilters.types.filter((t) => t !== type)
      : [...activeFilters.types, type];
    onFiltersChange({ ...activeFilters, types: newTypes });
  };

  const setDateRange = (range: string | null) => {
    onFiltersChange({
      ...activeFilters,
      dateRange: activeFilters.dateRange === range ? null : range,
    });
  };

  const setCategoryFilter = (category: string | null) => {
    onFiltersChange({
      ...activeFilters,
      category: activeFilters.category === category ? null : category,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({ types: [], dateRange: null, category: null });
  };

  const activeFilterCount =
    activeFilters.types.length +
    (activeFilters.dateRange ? 1 : 0) +
    (activeFilters.category ? 1 : 0);

  const getFilterChips = (): { label: string; onRemove: () => void }[] => {
    const chips: { label: string; onRemove: () => void }[] = [];

    activeFilters.types.forEach((type) => {
      const typeLabel = fileTypes.find((t) => t.value === type)?.label || type;
      chips.push({
        label: typeLabel,
        onRemove: () => toggleTypeFilter(type),
      });
    });

    if (activeFilters.dateRange) {
      const rangeLabel =
        dateRanges.find((r) => r.value === activeFilters.dateRange)?.label ||
        activeFilters.dateRange;
      chips.push({
        label: rangeLabel,
        onRemove: () => setDateRange(null),
      });
    }

    if (activeFilters.category) {
      chips.push({
        label: activeFilters.category,
        onRemove: () => setCategoryFilter(null),
      });
    }

    return chips;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-silver-mist" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search documents by name, description, or category..."
            className="w-full pl-10 pr-8 py-2 text-sm border border-cloud rounded-md bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20 focus:border-celestial-indigo transition-colors"
          />
          {localQuery && (
            <button
              onClick={() => {
                setLocalQuery("");
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-md transition-colors ${
              activeFilterCount > 0
                ? "border-celestial-indigo text-celestial-indigo bg-celestial-indigo/5"
                : "border-cloud text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:border-celestial-indigo/50"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-celestial-indigo text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className="h-3 w-3" />
          </button>

          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-stellar-blue border border-cloud rounded-lg shadow-lg z-50 p-4 space-y-4">
              {/* File Type */}
              <div>
                <h4 className="text-xs font-semibold text-ink-black dark:text-pearl mb-2 uppercase tracking-wide">
                  File Type
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {fileTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => toggleTypeFilter(type.value)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        activeFilters.types.includes(type.value)
                          ? "bg-celestial-indigo text-white border-celestial-indigo"
                          : "border-cloud text-silver-mist hover:border-celestial-indigo/50 hover:text-ink-black dark:hover:text-pearl"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h4 className="text-xs font-semibold text-ink-black dark:text-pearl mb-2 uppercase tracking-wide">
                  Date Range
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {dateRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setDateRange(range.value)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        activeFilters.dateRange === range.value
                          ? "bg-celestial-indigo text-white border-celestial-indigo"
                          : "border-cloud text-silver-mist hover:border-celestial-indigo/50 hover:text-ink-black dark:hover:text-pearl"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h4 className="text-xs font-semibold text-ink-black dark:text-pearl mb-2 uppercase tracking-wide">
                  Category
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        activeFilters.category === cat
                          ? "bg-celestial-indigo text-white border-celestial-indigo"
                          : "border-cloud text-silver-mist hover:border-celestial-indigo/50 hover:text-ink-black dark:hover:text-pearl"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear All */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="w-full text-xs text-celestial-indigo hover:text-celestial-indigo/80 font-medium pt-2 border-t border-cloud"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {getFilterChips().map((chip, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-celestial-indigo/10 text-celestial-indigo"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="hover:text-celestial-indigo/70 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
