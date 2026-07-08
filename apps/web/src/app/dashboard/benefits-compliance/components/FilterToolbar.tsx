import * as React from 'react';
import { Search, RotateCcw, Filter, Eye, EyeOff } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'date';
  options?: FilterOption[];
}

interface FilterToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  filters: Record<string, string>;
  onFilterChange: (name: string, value: string) => void;
  fields: FilterField[];
  onReset: () => void;
  showDeleted: boolean;
  onToggleDeleted: (showDeleted: boolean) => void;
  placeholder?: string;
}

export function FilterToolbar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  fields,
  onReset,
  showDeleted,
  onToggleDeleted,
  placeholder = 'Search...',
}: FilterToolbarProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const activeFiltersCount =
    Object.values(filters).filter(Boolean).length + (search ? 1 : 0) + (showDeleted ? 1 : 0);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm select-none">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-350"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
            showAdvanced || activeFiltersCount > 0
              ? 'border-slate-800 bg-slate-900 text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white shrink-0">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onToggleDeleted(!showDeleted)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
            showDeleted
              ? 'border-amber-250 bg-amber-50 text-amber-800 hover:bg-amber-100'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {showDeleted ? (
            <EyeOff className="h-4 w-4 text-amber-700" />
          ) : (
            <Eye className="h-4 w-4 text-slate-550" />
          )}
          {showDeleted ? 'Showing Archived' : 'Show Archived'}
        </button>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" />
            Reset
          </button>
        )}
      </div>

      {showAdvanced && fields.length > 0 && (
        <div className="grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-fade-in">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  value={filters[field.name] ?? ''}
                  onChange={(e) => onFilterChange(field.name, e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-all hover:bg-slate-50 focus:border-slate-400"
                >
                  <option value="">All</option>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="date"
                  value={filters[field.name] ?? ''}
                  onChange={(e) => onFilterChange(field.name, e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-slate-400"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
