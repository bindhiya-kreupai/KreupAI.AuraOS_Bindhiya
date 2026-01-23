"use client";

import React from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface TaxYearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
}

export default function TaxYearSelector({
  selectedYear,
  onYearChange,
  availableYears = [2024, 2023, 2022, 2021, 2020],
}: TaxYearSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-silver-mist" />
      <div className="relative">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="appearance-none bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-ink-black dark:text-pearl cursor-pointer focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              Tax Year {year}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist pointer-events-none" />
      </div>
    </div>
  );
}
