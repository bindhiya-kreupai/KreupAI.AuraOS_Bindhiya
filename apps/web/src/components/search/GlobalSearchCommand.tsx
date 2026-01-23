"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Clock, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useSearchStore } from '@/stores/search-store';
import { SearchResults } from './SearchResults';

export function GlobalSearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { results, loading } = useGlobalSearch(query);
  const { recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const handleSelect = (path: string) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
    router.push(path);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setOpen(false)} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50">
        <div className="bg-white dark:bg-stellar-blue rounded-xl shadow-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
            <Search className="w-5 h-5 text-silver-mist flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules, pages, employees..."
              className="flex-1 bg-transparent text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-silver-mist bg-slate-100 dark:bg-deep-cosmos rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {query.trim() ? (
              <SearchResults results={results} loading={loading} onSelect={handleSelect} />
            ) : (
              <div className="p-3">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                      <span className="text-[10px] font-medium text-silver-mist uppercase">Recent Searches</span>
                      <button onClick={clearRecentSearches} className="text-[10px] text-silver-mist hover:text-coral-alert flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                    </div>
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(search)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-ink-black dark:text-pearl hover:bg-slate-50 dark:hover:bg-deep-cosmos rounded-lg transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-silver-mist" />
                        {search}
                      </button>
                    ))}
                  </div>
                )}
                {recentSearches.length === 0 && (
                  <p className="text-center text-xs text-silver-mist py-6">
                    Type to search modules, pages, or employees
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-cloud dark:border-nebula-purple/50 flex items-center gap-4 text-[10px] text-silver-mist">
            <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Navigate</span>
            <span>ESC to close</span>
            <span className="ml-auto">⌘K to toggle</span>
          </div>
        </div>
      </div>
    </>
  );
}
