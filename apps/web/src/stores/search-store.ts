"use client";

import { useState, useCallback } from 'react';

export interface SearchResult {
  id: string;
  title: string;
  category: 'employee' | 'module' | 'document' | 'action';
  description?: string;
  path: string;
  icon?: string;
}

const STORAGE_KEY = 'aura_recent_searches';

export function useSearchStore() {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 10);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, []);

  return { recentSearches, addRecentSearch, clearRecentSearches };
}
