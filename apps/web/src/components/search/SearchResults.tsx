/**
 * @module SearchResults
 * @description Categorized search results display for the global command palette
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Command } from 'cmdk';
import { Users, LayoutGrid, FileText, ArrowRight } from 'lucide-react';
import type { SearchResults as SearchResultsType, SearchResultItem } from '@/hooks/useGlobalSearch';

interface SearchResultsProps {
  results: SearchResultsType;
  onSelect: (item: SearchResultItem) => void;
  isSearching: boolean;
  query: string;
}

const CATEGORY_CONFIG = {
  employees: {
    label: 'Employees',
    icon: Users,
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  modules: {
    label: 'Modules & Pages',
    icon: LayoutGrid,
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10',
  },
  documents: {
    label: 'Documents',
    icon: FileText,
    color: 'text-quantum-rose',
    bg: 'bg-quantum-rose/10',
  },
} as const;

const ResultGroup: React.FC<{
  category: keyof typeof CATEGORY_CONFIG;
  items: SearchResultItem[];
  onSelect: (item: SearchResultItem) => void;
}> = ({ category, items, onSelect }) => {
  if (items.length === 0) return null;

  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <Command.Group
      heading={
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className={`p-1 rounded ${config.bg}`}>
            <Icon className={`w-3 h-3 ${config.color}`} />
          </div>
          <span className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
            {config.label}
          </span>
          <span className="text-[9px] text-silver-mist/60">({items.length})</span>
        </div>
      }
    >
      {items.map((item) => (
        <Command.Item
          key={item.id}
          value={`${item.title} ${item.description}`}
          onSelect={() => onSelect(item)}
          className="flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg cursor-pointer data-[selected=true]:bg-celestial-indigo/5 dark:data-[selected=true]:bg-celestial-indigo/10 hover:bg-pearl/50 dark:hover:bg-deep-cosmos/50 transition-colors"
        >
          <div className={`shrink-0 p-1.5 rounded-lg ${config.bg}`}>
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
              {item.title}
            </p>
            <p className="text-[10px] text-silver-mist truncate">{item.description}</p>
          </div>
          <ArrowRight className="w-3 h-3 text-silver-mist/40 shrink-0 opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
        </Command.Item>
      ))}
    </Command.Group>
  );
};

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onSelect,
  isSearching,
  query,
}) => {
  if (isSearching) {
    return (
      <Command.Loading>
        <div className="flex items-center justify-center py-8">
          <div className="w-4 h-4 border-2 border-celestial-indigo/20 border-t-celestial-indigo rounded-full animate-spin" />
          <span className="ml-2 text-xs text-silver-mist">Searching...</span>
        </div>
      </Command.Loading>
    );
  }

  if (query && results.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <p className="text-sm text-silver-mist">No results for &ldquo;{query}&rdquo;</p>
        <p className="text-[10px] text-silver-mist/60 mt-1">
          Try a different search term or category
        </p>
      </div>
    );
  }

  return (
    <Command.List className="max-h-[360px] overflow-y-auto py-1">
      <ResultGroup category="employees" items={results.employees} onSelect={onSelect} />
      <ResultGroup category="modules" items={results.modules} onSelect={onSelect} />
      <ResultGroup category="documents" items={results.documents} onSelect={onSelect} />
    </Command.List>
  );
};

export default SearchResults;
