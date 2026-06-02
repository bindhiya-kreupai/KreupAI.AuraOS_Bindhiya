/**
 * @module SearchResultsPage
 * @description Full-page search results with sidebar facets, sort, pagination,
 *              and matched-text highlighting.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  SlidersHorizontal,
  User,
  FileText,
  Shield,
  Receipt,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { SearchService } from '@/services/searchService';
import type {
  AnySearchResult,
  GlobalSearchResults,
  SearchResultType,
  EmployeeSearchResult,
  DocumentSearchResult,
  PolicySearchResult,
  ExpenseReportSearchResult,
  LeaveRequestSearchResult,
} from '@/services/searchService';

// ── Highlight ─────────────────────────────────────────────────────────────────

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-amber-200 dark:bg-amber-900/50 text-inherit rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getResultIcon(type: string) {
  switch (type) {
    case 'employee':
      return <User className="w-4 h-4 text-celestial-indigo" />;
    case 'document':
      return <FileText className="w-4 h-4 text-emerald-500" />;
    case 'policy':
      return <Shield className="w-4 h-4 text-amber-500" />;
    case 'transaction':
      return <Receipt className="w-4 h-4 text-blue-500" />;
    case 'leave_request':
      return <Calendar className="w-4 h-4 text-purple-500" />;
    case 'expense_report':
      return <Receipt className="w-4 h-4 text-red-400" />;
    default:
      return <Search className="w-4 h-4 text-silver-mist" />;
  }
}

function getResultTitle(result: AnySearchResult): string {
  if ('name' in result) return result.name;
  if ('title' in result) return result.title;
  if ('reportName' in result) return result.reportName;
  if ('reference' in result) return result.reference;
  return 'Unknown';
}

function getResultDescription(result: AnySearchResult): string {
  switch (result.type) {
    case 'employee': {
      const r = result as EmployeeSearchResult;
      return `${r.title} · ${r.department} · ${r.location}`;
    }
    case 'document': {
      const r = result as DocumentSearchResult;
      return r.description;
    }
    case 'policy': {
      const r = result as PolicySearchResult;
      return `${r.description} (v${r.version})`;
    }
    case 'expense_report': {
      const r = result as ExpenseReportSearchResult;
      return `${r.reportCode} · ${r.employeeName} · ${r.currency} ${r.totalAmount.toFixed(2)}`;
    }
    case 'leave_request': {
      const r = result as LeaveRequestSearchResult;
      return `${r.employeeName} · ${r.leaveType} · ${r.startDate} to ${r.endDate}`;
    }
    default:
      return '';
  }
}

function getResultPath(result: AnySearchResult): string {
  if ('path' in result && typeof result.path === 'string') return result.path;
  switch (result.type) {
    case 'employee':
      return '/dashboard/core-hr/employee-database';
    case 'leave_request':
      return '/dashboard/leave';
    case 'expense_report':
      return '/dashboard/expenses';
    default:
      return '/dashboard';
  }
}

const TYPE_LABELS: Record<string, string> = {
  employee: 'People',
  document: 'Documents',
  policy: 'Policies',
  transaction: 'Transactions',
  leave_request: 'Leave Requests',
  expense_report: 'Expense Reports',
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date', label: 'Most Recent' },
  { value: 'name', label: 'Name (A-Z)' },
] as const;

const PAGE_SIZE = 10;

// ── Sidebar Facets ────────────────────────────────────────────────────────────

interface FacetSectionProps {
  title: string;
  options: { label: string; value: string; count: number }[];
  selected: string[];
  onChange: (value: string) => void;
}

function FacetSection({ title, options, selected, onChange }: FacetSectionProps) {
  if (!options.length) return null;
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-silver-mist uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => onChange(opt.value)}
              className="rounded border-cloud dark:border-nebula-purple/40 text-celestial-indigo focus:ring-celestial-indigo"
            />
            <span className="flex-1 text-sm text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">
              {opt.label}
            </span>
            <span className="text-xs text-silver-mist">{opt.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<GlobalSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'name'>('relevance');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(
    async (q: string, pg: number, sort: typeof sortBy, types: string[], depts: string[]) => {
      if (!q.trim()) {
        setSearchResults(null);
        return;
      }
      setIsLoading(true);
      try {
        const results = await SearchService.globalSearch(q, {
          page: pg,
          pageSize: PAGE_SIZE,
          sortBy: sort,
          sortOrder,
          types: types.length ? (types as SearchResultType[]) : undefined,
          departmentId: depts.length === 1 ? depts[0] : undefined,
        });
        setSearchResults(results);
      } catch {
        setSearchResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    [sortOrder]
  );

  useEffect(() => {
    performSearch(query, page, sortBy, selectedTypes, selectedDepts);
  }, [query, page, sortBy, selectedTypes, selectedDepts, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(inputValue);
    SearchService.saveRecentSearch(inputValue);
    router.replace(`/dashboard/search?q=${encodeURIComponent(inputValue)}`);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  const toggleDept = (dept: string) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedDepts([]);
    setPage(1);
  };

  const totalPages = searchResults ? Math.ceil(searchResults.totalCount / PAGE_SIZE) : 0;

  return (
    <div className="min-h-screen bg-pearl dark:bg-deep-cosmos">
      {/* Search Header */}
      <div className="bg-white dark:bg-stellar-blue border-b border-cloud dark:border-nebula-purple/30 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search employees, documents, policies..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/40 bg-transparent text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/30 focus:border-celestial-indigo"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-celestial-indigo text-white rounded-xl text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-colors ${
                showFilters || selectedTypes.length > 0 || selectedDepts.length > 0
                  ? 'bg-celestial-indigo/10 border-celestial-indigo text-celestial-indigo'
                  : 'border-cloud dark:border-nebula-purple/40 text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </form>

          {/* Quick stats */}
          {searchResults && (
            <div className="mt-2 flex items-center gap-4">
              <span className="text-xs text-silver-mist">
                {searchResults.totalCount.toLocaleString()} results for{' '}
                <span className="font-medium text-ink-black dark:text-pearl">
                  &quot;{query}&quot;
                </span>
              </span>
              <span className="text-xs text-silver-mist">in {searchResults.took}ms</span>
              {(selectedTypes.length > 0 || selectedDepts.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-celestial-indigo hover:underline"
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          {(showFilters || selectedTypes.length > 0 || selectedDepts.length > 0) && (
            <aside className="w-60 flex-shrink-0">
              <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-ink-black dark:text-pearl">Filters</h2>
                  {(selectedTypes.length > 0 || selectedDepts.length > 0) && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-silver-mist hover:text-quantum-rose transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Type filter */}
                <FacetSection
                  title="Type"
                  options={
                    searchResults?.facets.types ?? [
                      { label: 'People', value: 'employee', count: 0 },
                      { label: 'Documents', value: 'document', count: 0 },
                      { label: 'Policies', value: 'policy', count: 0 },
                    ]
                  }
                  selected={selectedTypes}
                  onChange={toggleType}
                />

                {/* Department filter */}
                {searchResults?.facets.departments &&
                  searchResults.facets.departments.length > 0 && (
                    <FacetSection
                      title="Department"
                      options={searchResults.facets.departments}
                      selected={selectedDepts}
                      onChange={toggleDept}
                    />
                  )}

                {/* Status filter */}
                {searchResults?.facets.statuses && searchResults.facets.statuses.length > 0 && (
                  <FacetSection
                    title="Status"
                    options={searchResults.facets.statuses}
                    selected={[]}
                    onChange={() => {}}
                  />
                )}
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            {searchResults && searchResults.totalCount > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-3.5 h-3.5 text-silver-mist" />
                <span className="text-xs text-silver-mist">Sort by:</span>
                <div className="flex items-center gap-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value);
                        setPage(1);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        sortBy === opt.value
                          ? 'bg-celestial-indigo text-white'
                          : 'text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos/50 hover:text-ink-black dark:hover:text-pearl'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-celestial-indigo animate-spin" />
              </div>
            )}

            {/* Results List */}
            {!isLoading && searchResults && searchResults.results.length > 0 && (
              <div className="space-y-3">
                {searchResults.results.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 p-4 hover:border-celestial-indigo/40 hover:shadow-sm transition-all cursor-pointer group"
                    onClick={() => router.push(getResultPath(result))}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-pearl dark:bg-deep-cosmos flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
                            {TYPE_LABELS[result.type] ?? result.type}
                          </span>
                          {'status' in result && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full capitalize">
                              {result.status as string}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors leading-snug">
                          {highlightText(getResultTitle(result), query)}
                        </h3>
                        <p className="text-xs text-silver-mist mt-0.5 line-clamp-2">
                          {highlightText(getResultDescription(result), query)}
                        </p>
                        {'tags' in result &&
                          Array.isArray(result.tags) &&
                          result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(result.tags as string[]).slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 bg-pearl dark:bg-deep-cosmos text-silver-mist rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-silver-mist opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {!isLoading && query && searchResults?.totalCount === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <Search className="w-12 h-12 text-silver-mist/20 mb-4" />
                <p className="text-base font-semibold text-ink-black dark:text-pearl">
                  No results for &quot;{query}&quot;
                </p>
                <p className="text-sm text-silver-mist mt-2">
                  Try different keywords, check spelling, or remove filters
                </p>
                {(selectedTypes.length > 0 || selectedDepts.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 text-sm text-celestial-indigo border border-celestial-indigo rounded-lg hover:bg-celestial-indigo/5 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Empty state (no query) */}
            {!isLoading && !query && (
              <div className="flex flex-col items-center justify-center py-20">
                <Search className="w-12 h-12 text-silver-mist/20 mb-4" />
                <p className="text-base font-semibold text-ink-black dark:text-pearl">
                  Search across your organization
                </p>
                <p className="text-sm text-silver-mist mt-2">
                  Find employees, documents, policies, and more
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-cloud dark:border-nebula-purple/20">
                <p className="text-xs text-silver-mist">
                  Page {page} of {totalPages} ({searchResults?.totalCount.toLocaleString()} results)
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = i + 1;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          pg === page
                            ? 'bg-celestial-indigo text-white'
                            : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos/50'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResultsPage;
