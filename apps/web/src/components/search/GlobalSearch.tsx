/**
 * @module GlobalSearch
 * @description Enterprise command palette search (Cmd+K) with typeahead, grouped results,
 *              recent searches, keyboard navigation, and loading skeletons.
 * @project AURA HCM Platform
 */

'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  User,
  FileText,
  Shield,
  Receipt,
  Calendar,
  ChevronRight,
  Loader2,
  Trash2,
} from 'lucide-react';
import { SearchService } from '@/services/searchService';
import type { AnySearchResult, SearchSuggestion } from '@/services/searchService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface GroupedResults {
  employees: AnySearchResult[];
  documents: AnySearchResult[];
  policies: AnySearchResult[];
  transactions: AnySearchResult[];
  leaves: AnySearchResult[];
  expenses: AnySearchResult[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getResultIcon(type: string) {
  switch (type) {
    case 'employee':
      return <User className="w-4 h-4" />;
    case 'document':
      return <FileText className="w-4 h-4" />;
    case 'policy':
      return <Shield className="w-4 h-4" />;
    case 'transaction':
      return <Receipt className="w-4 h-4" />;
    case 'leave_request':
      return <Calendar className="w-4 h-4" />;
    case 'expense_report':
      return <Receipt className="w-4 h-4" />;
    default:
      return <Search className="w-4 h-4" />;
  }
}

function getResultPath(result: AnySearchResult): string {
  if ('path' in result && typeof result.path === 'string') return result.path;
  switch (result.type) {
    case 'employee':
      return '/dashboard/core-hr/employee-database';
    case 'leave_request':
      return '/dashboard/leave/my-leaves';
    case 'expense_report':
      return '/dashboard/expenses';
    default:
      return '/dashboard';
  }
}

function getResultTitle(result: AnySearchResult): string {
  if ('name' in result) return result.name;
  if ('title' in result) return result.title;
  if ('reportName' in result) return result.reportName;
  if ('reference' in result) return result.reference;
  return 'Unknown';
}

function getResultSubtitle(result: AnySearchResult): string {
  switch (result.type) {
    case 'employee': {
      const r = result as import('@/services/searchService').EmployeeSearchResult;
      return `${r.title} · ${r.department}`;
    }
    case 'document': {
      const r = result as import('@/services/searchService').DocumentSearchResult;
      return `${r.category} · ${r.fileType.toUpperCase()}`;
    }
    case 'policy': {
      const r = result as import('@/services/searchService').PolicySearchResult;
      return `${r.category} · v${r.version}`;
    }
    case 'expense_report': {
      const r = result as import('@/services/searchService').ExpenseReportSearchResult;
      return `${r.employeeName} · ${r.currency} ${r.totalAmount.toFixed(2)}`;
    }
    case 'leave_request': {
      const r = result as import('@/services/searchService').LeaveRequestSearchResult;
      return `${r.employeeName} · ${r.leaveType} · ${r.days} days`;
    }
    default:
      return '';
  }
}

function groupResults(results: AnySearchResult[]): GroupedResults {
  return {
    employees: results.filter((r) => r.type === 'employee'),
    documents: results.filter((r) => r.type === 'document'),
    policies: results.filter((r) => r.type === 'policy'),
    transactions: results.filter((r) => r.type === 'transaction'),
    leaves: results.filter((r) => r.type === 'leave_request'),
    expenses: results.filter((r) => r.type === 'expense_report'),
  };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div className="px-4 py-2.5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-pearl dark:bg-deep-cosmos/60" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-pearl dark:bg-deep-cosmos/60 rounded w-2/3" />
          <div className="h-2.5 bg-pearl dark:bg-deep-cosmos/40 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// ── Result Item ───────────────────────────────────────────────────────────────

interface ResultItemProps {
  result: AnySearchResult;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

function ResultItem({ result, isActive, onClick, onMouseEnter }: ResultItemProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors group ${
        isActive
          ? 'bg-celestial-indigo/10 dark:bg-celestial-indigo/20'
          : 'hover:bg-pearl/50 dark:hover:bg-deep-cosmos/50'
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      role="option"
      aria-selected={isActive}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isActive
            ? 'bg-celestial-indigo text-white'
            : 'bg-pearl dark:bg-deep-cosmos text-silver-mist'
        }`}
      >
        {getResultIcon(result.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isActive ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'
          }`}
        >
          {getResultTitle(result)}
        </p>
        <p className="text-xs text-silver-mist truncate">{getResultSubtitle(result)}</p>
      </div>
      <ChevronRight
        className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity ${
          isActive ? 'text-celestial-indigo opacity-100' : 'opacity-0 group-hover:opacity-50'
        }`}
      />
    </div>
  );
}

// ── Group Header ──────────────────────────────────────────────────────────────

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="px-4 py-1.5 flex items-center justify-between">
      <span className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[10px] text-silver-mist/60">{count}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<AnySearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<{ query: string; timestamp: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(SearchService.getRecentSearches());
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Perform search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);
    setActiveIndex(-1);

    Promise.all([
      SearchService.globalSearch(debouncedQuery, { pageSize: 12 }),
      SearchService.getSearchSuggestions(debouncedQuery),
    ])
      .then(([searchResults, suggs]) => {
        setResults(searchResults.results);
        setSuggestions(suggs);
      })
      .catch(() => {
        setResults([]);
      })
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  // Keyboard shortcut
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    },
    [activeIndex, results]
  );

  const handleSelect = useCallback(
    (result: AnySearchResult) => {
      const path = getResultPath(result);
      SearchService.saveRecentSearch(query || getResultTitle(result));
      onClose();
      setQuery('');
      router.push(path);
    },
    [query, onClose, router]
  );

  const handleRecentSearch = useCallback((q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  }, []);

  const clearRecent = useCallback(() => {
    SearchService.clearRecentSearches();
    setRecentSearches([]);
  }, []);

  if (!isOpen) return null;

  const grouped = groupResults(results);
  const hasResults = results.length > 0;
  const _showSuggestions = !query && suggestions.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink-black/50 dark:bg-deep-cosmos/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed inset-x-0 top-[10vh] z-50 mx-auto max-w-2xl px-4"
        role="dialog"
        aria-modal="true"
        aria-label="Global Search"
      >
        <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/40 shadow-2xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 border-b border-cloud dark:border-nebula-purple/30">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-celestial-indigo animate-spin flex-shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-silver-mist flex-shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search employees, documents, policies..."
              className="flex-1 py-4 text-sm bg-transparent text-ink-black dark:text-pearl placeholder:text-silver-mist outline-none"
              role="combobox"
              aria-expanded={hasResults}
              aria-haspopup="listbox"
              aria-autocomplete="list"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5 text-silver-mist" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-silver-mist bg-pearl dark:bg-deep-cosmos rounded border border-cloud/50">
              ESC
            </kbd>
          </div>

          {/* Body */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto" role="listbox">
            {/* Loading skeletons */}
            {isLoading && (
              <div className="py-2">
                {[1, 2, 3, 4].map((n) => (
                  <ResultSkeleton key={n} />
                ))}
              </div>
            )}

            {/* Search Results */}
            {!isLoading && hasResults && (
              <div className="py-2">
                {grouped.employees.length > 0 && (
                  <div>
                    <GroupHeader label="People" count={grouped.employees.length} />
                    {grouped.employees.slice(0, 4).map((r, _i) => (
                      <ResultItem
                        key={r.id}
                        result={r}
                        isActive={results.indexOf(r) === activeIndex}
                        onClick={() => handleSelect(r)}
                        onMouseEnter={() => setActiveIndex(results.indexOf(r))}
                      />
                    ))}
                  </div>
                )}

                {grouped.documents.length > 0 && (
                  <div>
                    {grouped.employees.length > 0 && (
                      <div className="border-t border-cloud/50 dark:border-nebula-purple/20 mt-1 pt-1" />
                    )}
                    <GroupHeader label="Documents" count={grouped.documents.length} />
                    {grouped.documents.slice(0, 3).map((r) => (
                      <ResultItem
                        key={r.id}
                        result={r}
                        isActive={results.indexOf(r) === activeIndex}
                        onClick={() => handleSelect(r)}
                        onMouseEnter={() => setActiveIndex(results.indexOf(r))}
                      />
                    ))}
                  </div>
                )}

                {grouped.policies.length > 0 && (
                  <div>
                    <div className="border-t border-cloud/50 dark:border-nebula-purple/20 mt-1 pt-1" />
                    <GroupHeader label="Policies" count={grouped.policies.length} />
                    {grouped.policies.slice(0, 2).map((r) => (
                      <ResultItem
                        key={r.id}
                        result={r}
                        isActive={results.indexOf(r) === activeIndex}
                        onClick={() => handleSelect(r)}
                        onMouseEnter={() => setActiveIndex(results.indexOf(r))}
                      />
                    ))}
                  </div>
                )}

                {/* View all link */}
                <div className="border-t border-cloud/50 dark:border-nebula-purple/20 mt-1 px-4 py-2.5">
                  <button
                    onClick={() => {
                      SearchService.saveRecentSearch(query);
                      onClose();
                      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
                    }}
                    className="text-xs text-celestial-indigo hover:underline font-medium"
                  >
                    View all {results.length} results for &quot;{query}&quot;
                  </button>
                </div>
              </div>
            )}

            {/* No results */}
            {!isLoading && query && !hasResults && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Search className="w-10 h-10 text-silver-mist/20 mb-3" />
                <p className="text-sm font-medium text-ink-black dark:text-pearl">
                  No results for &quot;{query}&quot;
                </p>
                <p className="text-xs text-silver-mist mt-1">
                  Try different keywords or check your spelling
                </p>
              </div>
            )}

            {/* Recent Searches (when no query) */}
            {!query && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="flex items-center justify-between px-4 py-1.5">
                  <span className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
                    Recent Searches
                  </span>
                  <button
                    onClick={clearRecent}
                    className="flex items-center gap-1 text-[10px] text-silver-mist hover:text-quantum-rose transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    Clear
                  </button>
                </div>
                {recentSearches.slice(0, 6).map((r, i) => (
                  <div
                    key={`${r.query}-${i}`}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-pearl/50 dark:hover:bg-deep-cosmos/50 cursor-pointer transition-colors group"
                    onClick={() => handleRecentSearch(r.query)}
                  >
                    <Clock className="w-3.5 h-3.5 text-silver-mist/50 flex-shrink-0" />
                    <span className="text-sm text-ink-black dark:text-pearl flex-1 truncate">
                      {r.query}
                    </span>
                    <span className="text-[10px] text-silver-mist/50">
                      {new Date(r.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!query && recentSearches.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Search className="w-10 h-10 text-silver-mist/20 mb-3" />
                <p className="text-sm text-silver-mist">Start typing to search</p>
                <p className="text-[11px] text-silver-mist/60 mt-1">
                  Search across employees, documents, and policies
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-cloud/50 dark:border-nebula-purple/20 px-4 py-2.5 flex items-center gap-4">
            {[
              { keys: ['↑', '↓'], label: 'Navigate' },
              { keys: ['↵'], label: 'Open' },
              { keys: ['esc'], label: 'Close' },
            ].map(({ keys, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] text-silver-mist">
                {keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-1.5 py-0.5 bg-pearl dark:bg-deep-cosmos rounded text-[9px] border border-cloud/50 dark:border-nebula-purple/30"
                  >
                    {k}
                  </kbd>
                ))}
                {label}
              </div>
            ))}
            <span className="ml-auto text-[10px] text-silver-mist/50">
              Press{' '}
              <kbd className="px-1 py-0.5 bg-pearl dark:bg-deep-cosmos rounded text-[9px] border border-cloud/50">
                ⌘K
              </kbd>{' '}
              to toggle
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default GlobalSearch;
