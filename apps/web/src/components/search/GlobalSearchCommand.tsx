/**
 * @module GlobalSearchCommand
 * @description Command palette (Cmd+K / Ctrl+K) with global search across employees, modules, and documents
 * @project AURA HCM Platform
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Clock, X, Trash2 } from 'lucide-react';
import { useSearch } from '@/stores/search-store';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import type { SearchResultItem } from '@/hooks/useGlobalSearch';
import type { SearchCategory } from '@/stores/search-store';
import { SearchResults } from './SearchResults';

const CATEGORY_TABS: { value: SearchCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'employees', label: 'Employees' },
  { value: 'modules', label: 'Modules' },
  { value: 'documents', label: 'Documents' },
];

export const GlobalSearchCommand: React.FC = () => {
  const router = useRouter();
  const {
    recentSearches,
    filters,
    isOpen,
    setIsOpen,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
    setFilters,
  } = useSearch();

  const {
    query,
    setQuery,
    results,
    isSearching,
    hasResults: _hasResults,
    totalResults,
  } = useGlobalSearch({ category: filters.category, debounceMs: 200 });

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Handle result selection
  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      addRecentSearch({
        query: item.title,
        category: item.category,
        resultCount: 1,
      });
      setIsOpen(false);
      setQuery('');
      router.push(item.path);
    },
    [addRecentSearch, setIsOpen, setQuery, router]
  );

  // Handle recent search click
  const handleRecentClick = useCallback(
    (search: { query: string; category: SearchCategory }) => {
      setQuery(search.query);
      setFilters({ category: search.category });
    },
    [setQuery, setFilters]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink-black/40 dark:bg-deep-cosmos/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette */}
      <div className="fixed inset-x-0 top-[15vh] z-50 mx-auto max-w-2xl px-4">
        <Command
          className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-2xl overflow-hidden"
          shouldFilter={false}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-cloud dark:border-nebula-purple/30">
            <Search className="w-4 h-4 text-silver-mist shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search employees, modules, documents..."
              className="flex-1 py-3.5 text-sm bg-transparent text-ink-black dark:text-pearl placeholder:text-silver-mist outline-none"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
              >
                <X className="w-3.5 h-3.5 text-silver-mist" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-silver-mist bg-pearl dark:bg-deep-cosmos rounded border border-cloud/50 dark:border-nebula-purple/30">
              ESC
            </kbd>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-cloud/50 dark:border-nebula-purple/20">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilters({ category: tab.value })}
                className={`px-3 py-1 text-[10px] font-semibold rounded-full transition-colors ${
                  filters.category === tab.value
                    ? 'bg-celestial-indigo text-white'
                    : 'text-silver-mist hover:bg-pearl dark:hover:bg-deep-cosmos'
                }`}
              >
                {tab.label}
              </button>
            ))}
            {query && totalResults > 0 && (
              <span className="ml-auto text-[10px] text-silver-mist">
                {totalResults} result{totalResults !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Results or Recent Searches */}
          {query ? (
            <SearchResults
              results={results}
              onSelect={handleSelect}
              isSearching={isSearching}
              query={query}
            />
          ) : (
            <div className="max-h-[360px] overflow-y-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 ? (
                <div className="py-2">
                  <div className="flex items-center justify-between px-4 py-1.5">
                    <span className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
                      Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="flex items-center gap-1 text-[10px] text-silver-mist hover:text-quantum-rose transition-colors"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((search, i) => (
                    <div
                      key={`${search.query}-${i}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-pearl/50 dark:hover:bg-deep-cosmos/50 cursor-pointer transition-colors group"
                      onClick={() => handleRecentClick(search)}
                    >
                      <Clock className="w-3.5 h-3.5 text-silver-mist/50 shrink-0" />
                      <span className="text-sm text-ink-black dark:text-pearl flex-1 truncate">
                        {search.query}
                      </span>
                      <span className="text-[9px] text-silver-mist capitalize">
                        {search.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(search.query);
                        }}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-quantum-rose/10 transition-all"
                      >
                        <X className="w-2.5 h-2.5 text-silver-mist" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <Search className="w-8 h-8 text-silver-mist/20 mb-3" />
                  <p className="text-sm text-silver-mist">Start typing to search</p>
                  <p className="text-[10px] text-silver-mist/60 mt-1">
                    Search across employees, modules, and documents
                  </p>
                </div>
              )}

              {/* Quick Actions Footer */}
              <div className="border-t border-cloud/50 dark:border-nebula-purple/20 px-4 py-2.5 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-silver-mist">
                  <kbd className="px-1.5 py-0.5 bg-pearl dark:bg-deep-cosmos rounded text-[9px] border border-cloud/50 dark:border-nebula-purple/30">
                    ↑↓
                  </kbd>
                  Navigate
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-silver-mist">
                  <kbd className="px-1.5 py-0.5 bg-pearl dark:bg-deep-cosmos rounded text-[9px] border border-cloud/50 dark:border-nebula-purple/30">
                    ↵
                  </kbd>
                  Open
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-silver-mist">
                  <kbd className="px-1.5 py-0.5 bg-pearl dark:bg-deep-cosmos rounded text-[9px] border border-cloud/50 dark:border-nebula-purple/30">
                    esc
                  </kbd>
                  Close
                </div>
              </div>
            </div>
          )}
        </Command>
      </div>
    </>
  );
};

export default GlobalSearchCommand;
