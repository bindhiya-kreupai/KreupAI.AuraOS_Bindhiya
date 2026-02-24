/**
 * @module TaxYearSelector
 * @description Year / financial-year dropdown for the Tax Documents Viewer
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type TaxRegion = 'us' | 'india';

export interface TaxYear {
  value: string; // e.g. "2025" or "2025-26"
  label: string; // e.g. "Tax Year 2025" or "FY 2025-26"
  calendarYear: number;
}

interface TaxYearSelectorProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  region: TaxRegion;
  onRegionChange?: (region: TaxRegion) => void;
  className?: string;
}

// ── Year Generators ────────────────────────────────────────────────────────────

function generateUSYears(): TaxYear[] {
  const currentYear = new Date().getFullYear();
  const years: TaxYear[] = [];
  for (let y = currentYear; y >= currentYear - 6; y--) {
    years.push({
      value: String(y),
      label: `Tax Year ${y}`,
      calendarYear: y,
    });
  }
  return years;
}

function generateIndiaYears(): TaxYear[] {
  const now = new Date();
  const currentFY = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const years: TaxYear[] = [];
  for (let y = currentFY; y >= currentFY - 6; y--) {
    const endYear = String(y + 1).slice(-2);
    years.push({
      value: `${y}-${endYear}`,
      label: `FY ${y}-${endYear}`,
      calendarYear: y,
    });
  }
  return years;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const TaxYearSelector: React.FC<TaxYearSelectorProps> = ({
  selectedYear,
  onYearChange,
  region,
  onRegionChange,
  className = '',
}) => {
  const years = region === 'india' ? generateIndiaYears() : generateUSYears();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Region Toggle */}
      {onRegionChange && (
        <div className="flex bg-pearl dark:bg-deep-cosmos rounded-xl p-0.5 border border-cloud dark:border-nebula-purple/30">
          <button
            onClick={() => onRegionChange('us')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              region === 'us'
                ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
            }`}
          >
            US
          </button>
          <button
            onClick={() => onRegionChange('india')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              region === 'india'
                ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
            }`}
          >
            India
          </button>
        </div>
      )}

      {/* Year Dropdown */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Calendar className="w-4 h-4 text-celestial-indigo" />
        </div>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="appearance-none pl-9 pr-8 py-2 text-sm font-medium bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo cursor-pointer transition-colors"
        >
          {years.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
        </div>
      </div>
    </div>
  );
};

export default TaxYearSelector;
