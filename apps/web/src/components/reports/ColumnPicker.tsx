'use client';

import React, { useState, useEffect } from 'react';
import { Columns, Check, GripVertical, Search, X, Loader2 } from 'lucide-react';

interface Column {
  id: string;
  name: string;
  type: string;
  category: string;
}

interface ColumnPickerProps {
  dataSource?: string;
  selectedColumns?: string[];
  onChange?: (columnIds: string[]) => void;
}

const typeColors: Record<string, string> = {
  text: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
  number: 'bg-green-100 dark:bg-green-900/20 text-green-600',
  currency: 'bg-green-100 dark:bg-green-900/20 text-green-600',
  date: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
  boolean: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600',
};

export function ColumnPicker({
  dataSource = 'employees',
  selectedColumns: initial,
  onChange,
}: ColumnPickerProps) {
  const [selected, setSelected] = useState<string[]>(initial || []);
  const [search, setSearch] = useState('');
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) setSelected(initial);
  }, [initial]);

  useEffect(() => {
    if (!dataSource) {
      setColumns([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/v1/reports/metadata?dataSource=${encodeURIComponent(dataSource)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json.success && json.data?.columns) {
          setColumns(json.data.columns);
        } else {
          setError(json.error?.message || 'Failed to load columns');
        }
      })
      .catch(() => active && setError('Failed to load columns'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [dataSource]);

  const filtered = columns.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(filtered.map((c) => c.category))];

  const toggleColumn = (id: string) => {
    const updated = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    setSelected(updated);
    onChange?.(updated);
  };

  const removeColumn = (id: string) => {
    const updated = selected.filter((s) => s !== id);
    setSelected(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Columns className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Select Columns</h3>
        <span className="text-xs text-silver-mist ml-auto">{selected.length} selected</span>
      </div>

      {selected.length > 0 && (
        <div className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos">
          <p className="text-xs font-medium text-silver-mist mb-2">Column Order</p>
          <div className="space-y-1">
            {selected.map((id) => {
              const col = columns.find((c) => c.id === id);
              if (!col) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 px-2 py-1.5 bg-white dark:bg-stellar-blue rounded border border-cloud dark:border-nebula-purple/50"
                >
                  <GripVertical className="w-3 h-3 text-silver-mist cursor-grab" />
                  <span className="text-xs text-ink-black dark:text-pearl flex-1">{col.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[col.type] || ''}`}
                  >
                    {col.type}
                  </span>
                  <button
                    onClick={() => removeColumn(id)}
                    className="text-silver-mist hover:text-coral-alert"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50">
        <Search className="w-4 h-4 text-silver-mist" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search columns..."
          className="flex-1 text-sm bg-transparent outline-none text-ink-black dark:text-pearl placeholder:text-silver-mist"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-celestial-indigo animate-spin" />
        </div>
      ) : error ? (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      ) : columns.length === 0 ? (
        <p className="text-sm text-silver-mist py-4 text-center">
          Select a data source to see available columns
        </p>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {categories.map((category) => (
            <div key={category}>
              <p className="text-xs font-medium text-silver-mist uppercase tracking-wide mb-1.5">
                {category}
              </p>
              <div className="space-y-1">
                {filtered
                  .filter((c) => c.category === category)
                  .map((col) => {
                    const isSelected = selected.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        onClick={() => toggleColumn(col.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-celestial-indigo/5 border border-celestial-indigo/30'
                            : 'border border-transparent hover:bg-slate-50 dark:hover:bg-deep-cosmos'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected
                              ? 'bg-celestial-indigo border-celestial-indigo'
                              : 'border-cloud dark:border-nebula-purple/50'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-ink-black dark:text-pearl flex-1">
                          {col.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[col.type] || ''}`}
                        >
                          {col.type}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
