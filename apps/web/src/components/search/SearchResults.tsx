"use client";

import React from 'react';
import { LayoutGrid, User, FileText, Zap } from 'lucide-react';
import { SearchResult } from '@/stores/search-store';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onSelect: (path: string) => void;
}

const categoryIcons = {
  module: LayoutGrid,
  employee: User,
  document: FileText,
  action: Zap,
};

const categoryLabels = {
  module: 'Modules',
  employee: 'Employees',
  document: 'Documents',
  action: 'Quick Actions',
};

export function SearchResults({ results, loading, onSelect }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-5 h-5 border-2 border-celestial-indigo border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-silver-mist mt-2">Searching...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-xs text-silver-mist">No results found</p>
      </div>
    );
  }

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {});

  return (
    <div className="p-2">
      {Object.entries(grouped).map(([category, items]) => {
        const Icon = categoryIcons[category as keyof typeof categoryIcons] || LayoutGrid;
        return (
          <div key={category} className="mb-3 last:mb-0">
            <p className="text-[10px] font-medium text-silver-mist uppercase px-2 mb-1">
              {categoryLabels[category as keyof typeof categoryLabels] || category}
            </p>
            {items.map((result) => (
              <button
                key={result.id}
                onClick={() => onSelect(result.path)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-deep-cosmos rounded-lg transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-silver-mist group-hover:bg-celestial-indigo/10 group-hover:text-celestial-indigo transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">{result.title}</p>
                  {result.description && (
                    <p className="text-[10px] text-silver-mist truncate">{result.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
