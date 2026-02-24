/**
 * @module DocumentSearch
 * @description Search within documents with filters for the Document Vault
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Search, X, SlidersHorizontal, Calendar, Tag, FileType } from 'lucide-react';
import type { DocumentFilters, FileFormat } from '@/services/documentService';

// ── Props ──────────────────────────────────────────────────────────────────────

interface DocumentSearchProps {
  onSearch: (query: string) => void;
  filters: DocumentFilters;
  onFiltersChange: (filters: DocumentFilters) => void;
  resultCount: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const FILE_TYPES: { value: FileFormat | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'pptx', label: 'PowerPoint' },
  { value: 'jpg', label: 'Image' },
  { value: 'png', label: 'Image (PNG)' },
  { value: 'txt', label: 'Text' },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'personal', label: 'Personal' },
  { value: 'employment', label: 'Employment' },
  { value: 'payroll', label: 'Payroll & Tax' },
  { value: 'training', label: 'Training' },
  { value: 'company', label: 'Company' },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'lastModified-desc', label: 'Newest first' },
  { value: 'lastModified-asc', label: 'Oldest first' },
  { value: 'title-asc', label: 'Name (A-Z)' },
  { value: 'title-desc', label: 'Name (Z-A)' },
  { value: 'fileSize-desc', label: 'Largest first' },
  { value: 'fileSize-asc', label: 'Smallest first' },
];

// ── Component ──────────────────────────────────────────────────────────────────

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  onSearch,
  filters,
  onFiltersChange,
  resultCount,
}) => {
  const [query, setQuery] = useState(filters.query || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleFilterChange = useCallback(
    (key: keyof DocumentFilters, value: string) => {
      const updated = { ...filters };
      if (value === '') {
        delete updated[key];
      } else if (key === 'sortBy') {
        const [sortBy, sortOrder] = value.split('-');
        updated.sortBy = sortBy as DocumentFilters['sortBy'];
        updated.sortOrder = sortOrder as 'asc' | 'desc';
      } else {
        (updated as Record<string, unknown>)[key] = value;
      }
      onFiltersChange(updated);
    },
    [filters, onFiltersChange]
  );

  const activeFilterCount = [
    filters.category,
    filters.fileFormat,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-2">
      {/* Search Bar */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-pearl dark:bg-stellar-blue rounded-xl border border-transparent hover:border-celestial-indigo/30 focus:border-celestial-indigo focus:outline-none text-ink-black dark:text-pearl placeholder:text-silver-mist transition-colors"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-cloud dark:hover:bg-deep-cosmos transition-colors"
            >
              <X className="w-3.5 h-3.5 text-silver-mist" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-xl border transition-colors relative ${
            showFilters || activeFilterCount > 0
              ? 'bg-celestial-indigo/10 border-celestial-indigo/30 text-celestial-indigo'
              : 'bg-pearl dark:bg-stellar-blue border-transparent text-silver-mist hover:text-twilight dark:hover:text-pearl'
          }`}
          title="Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-celestial-indigo text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter info */}
      {query && (
        <p className="text-[10px] text-silver-mist px-1">
          {resultCount} result{resultCount !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-pearl/50 dark:bg-stellar-blue/50 rounded-xl p-3 space-y-3 border border-cloud/50 dark:border-nebula-purple/20">
          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-1">
                <Tag className="w-3 h-3" /> Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Type */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-1">
                <FileType className="w-3 h-3" /> File Type
              </label>
              <select
                value={filters.fileFormat || ''}
                onChange={(e) => handleFilterChange('fileFormat', e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
              >
                {FILE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-1">
                <Calendar className="w-3 h-3" /> From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-1">
                <Calendar className="w-3 h-3" /> To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-white dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider mb-1 block">
              Sort By
            </label>
            <select
              value={`${filters.sortBy || 'lastModified'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-white dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => onFiltersChange({})}
              className="text-[10px] text-quantum-rose hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentSearch;
