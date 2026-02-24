/**
 * @module SearchStore
 * @description Store for managing recent searches, search filters, and search state
 * @project AURA HCM Platform
 */

'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type SearchCategory = 'all' | 'employees' | 'modules' | 'documents';

export interface RecentSearch {
  query: string;
  category: SearchCategory;
  timestamp: number;
  resultCount?: number;
}

export interface SearchFilter {
  category: SearchCategory;
  department?: string;
  module?: string;
}

interface SearchContextType {
  recentSearches: RecentSearch[];
  filters: SearchFilter;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addRecentSearch: (search: Omit<RecentSearch, 'timestamp'>) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;
  setFilters: (filters: Partial<SearchFilter>) => void;
  resetFilters: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'aura_recent_searches';
const MAX_RECENT = 10;

const DEFAULT_FILTERS: SearchFilter = {
  category: 'all',
};

// ── Context ────────────────────────────────────────────────────────────────────

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [filters, setFiltersState] = useState<SearchFilter>(DEFAULT_FILTERS);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      /* Failed to load recent searches */
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
      } catch {
        /* Failed to save recent searches */
      }
    }
  }, [recentSearches, isHydrated]);

  const addRecentSearch = useCallback((search: Omit<RecentSearch, 'timestamp'>) => {
    if (!search.query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.query.toLowerCase() !== search.query.toLowerCase());
      const newSearch: RecentSearch = {
        ...search,
        timestamp: Date.now(),
      };
      return [newSearch, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => prev.filter((s) => s.query.toLowerCase() !== query.toLowerCase()));
  }, []);

  const setFilters = useCallback((newFilters: Partial<SearchFilter>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  return React.createElement(
    SearchContext.Provider,
    {
      value: {
        recentSearches,
        filters,
        isOpen,
        setIsOpen,
        addRecentSearch,
        clearRecentSearches,
        removeRecentSearch,
        setFilters,
        resetFilters,
      },
    },
    children
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchProvider;
