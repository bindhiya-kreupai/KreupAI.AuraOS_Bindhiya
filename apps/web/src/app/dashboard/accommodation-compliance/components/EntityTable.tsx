import * as React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal, Settings2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
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
}: EntityTableProps<T>) {
  const [visibleKeys, setVisibleKeys] = React.useState<string[]>([]);
  const [showColMenu, setShowColMenu] = React.useState(false);
  const colMenuRef = React.useRef<HTMLDivElement>(null);

  // Initialize visible keys
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
    const current = sort.find((s) => s.field === field);
    if (!current) {
      onSortChange([{ field, dir: 'asc' }]);
    } else if (current.dir === 'asc') {
      onSortChange([{ field, dir: 'desc' }]);
    } else {
      onSortChange([]);
    }
  };

  const getSortIcon = (field: string) => {
    const current = sort.find((s) => s.field === field);
    if (!current) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 text-slate-450" />;
    return current.dir === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 ml-1 text-slate-900" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 ml-1 text-slate-900" />
    );
  };

  const visibleColumns = columns.filter((col) => visibleKeys.includes(col.key));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm select-none">
      {/* Visibility control toolbar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Results ({total} items)
        </span>

        <div className="relative" ref={colMenuRef}>
          <button
            type="button"
            onClick={() => setShowColMenu(!showColMenu)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-350 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5 text-slate-500" />
            Columns
          </button>

          {showColMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5 z-40 max-h-60 overflow-y-auto animate-fade-in-up">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Visible Columns
              </span>
              {columns.map((col) => {
                const isVisible = visibleKeys.includes(col.key);
                return (
                  <label
                    key={col.key}
                    className="flex items-center gap-2.5 px-1 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setVisibleKeys([...visibleKeys, col.key]);
                        } else {
                          setVisibleKeys(visibleKeys.filter((k) => k !== col.key));
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                    <span className="text-xs font-medium text-slate-700">{col.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3 select-none ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-100 hover:text-slate-900' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
              {actions && <th className="w-12 px-4 py-3 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-slate-150 rounded" />
                  </td>
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 bg-slate-150 rounded w-4/5" />
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5">
                      <div className="h-4 bg-slate-150 rounded" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 2}
                  className="px-4 py-12 text-center text-slate-450 font-medium"
                >
                  No records found. Try modifying filters or adding entries.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    selectedIds.includes(row.id) ? 'bg-slate-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                  </td>
                  {visibleColumns.map((col) => {
                    const content = col.render ? col.render(row) : (row as any)[col.key];
                    return (
                      <td key={col.key} className="px-4 py-3 font-medium text-slate-800">
                        {content ?? '—'}
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-800 focus:border-slate-400 focus:outline-none"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>per page</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 1 || loading}
            onClick={() => onPageChange(page - 1)}
            className="rounded-xl border border-slate-350 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="rounded-xl border border-slate-350 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
