import * as React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Settings2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface EntityTableProps<T extends { id: string }> {
  columns: Array<Column<T>>;
  data: T[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sort?: Array<{ field: string; dir: 'asc' | 'desc' }>;
  onSortChange?: (sort: Array<{ field: string; dir: 'asc' | 'desc' }>) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
}

export function EntityTable<T extends { id: string }>({
  columns,
  data,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sort = [],
  onSortChange,
  selectedIds,
  onSelectedIdsChange,
  actions,
  emptyMessage = 'No records found.',
}: EntityTableProps<T>) {
  const [visibleKeys, setVisibleKeys] = React.useState<string[]>([]);
  const [showColMenu, setShowColMenu] = React.useState(false);
  const colMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setVisibleKeys(columns.map((c) => c.key));
  }, [columns]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(event.target as Node)) {
        setShowColMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedIdsChange(data.map((row) => row.id));
    } else {
      onSelectedIdsChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      onSelectedIdsChange([...selectedIds, id]);
    } else {
      onSelectedIdsChange(selectedIds.filter((x) => x !== id));
    }
  };

  const handleSort = (field: string) => {
    if (!onSortChange) return;
    const existing = sort.find((s) => s.field === field);
    if (!existing) {
      onSortChange([{ field, dir: 'asc' }]);
    } else if (existing.dir === 'asc') {
      onSortChange([{ field, dir: 'desc' }]);
    } else {
      onSortChange(sort.filter((s) => s.field !== field));
    }
  };

  const getSortDir = (field: string): 'asc' | 'desc' | null => {
    return sort.find((s) => s.field === field)?.dir ?? null;
  };

  const visibleColumns = columns.filter((c) => visibleKeys.includes(c.key));

  const allPageSelected = data.length > 0 && data.every((row) => selectedIds.includes(row.id));
  const someSelected = selectedIds.length > 0 && !allPageSelected;

  return (
    <div className="flex flex-col gap-2">
      {/* Table Wrapper */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <span className="text-xs font-semibold text-slate-500">
            {total.toLocaleString()} record{total !== 1 ? 's' : ''}
            {selectedIds.length > 0 && (
              <span className="ml-1.5 text-sky-600">({selectedIds.length} selected)</span>
            )}
          </span>
          <div className="relative" ref={colMenuRef}>
            <button
              type="button"
              onClick={() => setShowColMenu(!showColMenu)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Columns
            </button>
            {showColMenu && (
              <div className="absolute right-0 mt-1 w-52 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
                {columns.map((col) => (
                  <label
                    key={col.key}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={visibleKeys.includes(col.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setVisibleKeys([...visibleKeys, col.key]);
                        } else {
                          setVisibleKeys(visibleKeys.filter((k) => k !== col.key));
                        }
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <table className="w-full min-w-max text-left text-sm">
          <thead className="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                />
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold ${col.sortable && onSortChange ? 'cursor-pointer select-none hover:text-slate-900' : ''} ${col.className ?? ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-slate-400">
                        {getSortDir(col.key) === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-slate-700" />
                        ) : getSortDir(col.key) === 'desc' ? (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-700" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
                  </td>
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div
                        className="h-4 animate-pulse rounded bg-slate-100"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                      />
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3" />}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (actions ? 2 : 1)}
                  className="px-4 py-12 text-center text-sm text-slate-400 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-slate-50/80 ${selectedIds.includes(row.id) ? 'bg-sky-50/50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                    />
                  </td>
                  {visibleColumns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.className ?? ''}`}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 px-1 text-sm text-slate-600 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(1)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            «
          </button>
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ‹ Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next ›
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(totalPages)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
