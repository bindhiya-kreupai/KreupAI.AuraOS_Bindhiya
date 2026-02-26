/**
 * @module ReportViewer
 * @description In-app report preview with column toggles, sort, filter, export, and print.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Download,
  Printer,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type {
  ReportColumn,
  ReportPreviewData,
  GeneratedReport,
} from '@/services/reportGenerationService';
import { CATEGORY_META } from '@/services/reportGenerationService';

// ── Types ──────────────────────────────────────────────────────────────────────

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: string;
  direction: SortDirection;
}

// ── Cell formatter ────────────────────────────────────────────────────────────

function formatCell(value: unknown, type: ReportColumn['type']): string {
  if (value === null || value === undefined) return '—';
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        Number(value)
      );
    case 'number':
      return Number(value).toLocaleString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      return new Date(String(value)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    default:
      return String(value);
  }
}

// ── Column Visibility Panel ───────────────────────────────────────────────────

interface ColumnPanelProps {
  columns: ReportColumn[];
  visibleFields: Set<string>;
  onToggle: (field: string) => void;
  onClose: () => void;
}

function ColumnPanel({ columns, visibleFields, onToggle, onClose }: ColumnPanelProps) {
  return (
    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl shadow-xl z-20 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-ink-black dark:text-pearl">
          Column Visibility
        </span>
        <button
          onClick={onClose}
          className="p-0.5 hover:bg-pearl dark:hover:bg-deep-cosmos rounded"
        >
          <X className="w-3.5 h-3.5 text-silver-mist" />
        </button>
      </div>
      {columns.map((col) => (
        <label key={col.field} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={visibleFields.has(col.field)}
            onChange={() => onToggle(col.field)}
            className="rounded border-cloud dark:border-nebula-purple/40 text-celestial-indigo"
          />
          <span className="text-xs text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">
            {col.label}
          </span>
        </label>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ReportViewerProps {
  report?: GeneratedReport;
  previewData: ReportPreviewData;
  onClose?: () => void;
}

const PAGE_SIZE = 10;

export function ReportViewer({ report, previewData, onClose }: ReportViewerProps) {
  const [sort, setSort] = useState<SortState>({ field: '', direction: null });
  const [filterQuery, setFilterQuery] = useState('');
  const [visibleFields, setVisibleFields] = useState<Set<string>>(
    new Set(previewData.columns.map((c) => c.field))
  );
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [page, setPage] = useState(1);

  const visibleColumns = previewData.columns.filter((c) => visibleFields.has(c.field));

  // Filter
  const filteredRows = useMemo(() => {
    if (!filterQuery.trim()) return previewData.rows;
    const q = filterQuery.toLowerCase();
    return previewData.rows.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? '')
          .toLowerCase()
          .includes(q)
      )
    );
  }, [previewData.rows, filterQuery]);

  // Sort
  const sortedRows = useMemo(() => {
    if (!sort.field || !sort.direction) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];
      const col = previewData.columns.find((c) => c.field === sort.field);
      let cmp = 0;
      if (col?.type === 'number' || col?.type === 'currency') {
        cmp = Number(aVal) - Number(bVal);
      } else {
        cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''));
      }
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sort, previewData.columns]);

  // Paginate
  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);
  const paginatedRows = sortedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = useCallback((field: string) => {
    setSort((prev) => {
      if (prev.field !== field) return { field, direction: 'asc' };
      if (prev.direction === 'asc') return { field, direction: 'desc' };
      return { field: '', direction: null };
    });
    setPage(1);
  }, []);

  const toggleColumn = useCallback((field: string) => {
    setVisibleFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        if (next.size === 1) return prev; // Keep at least one column
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }, []);

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // In production, call API. For now, just log.
    console.warn(`Exporting as ${format}`);
    if (report?.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const categoryMeta = report ? CATEGORY_META[report.category] : null;

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cloud dark:border-nebula-purple/20">
        <div className="flex items-center gap-3 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
              aria-label="Close viewer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-silver-mist flex-shrink-0" />
              <h2 className="text-sm font-semibold text-ink-black dark:text-pearl truncate">
                {report?.title ?? 'Report Preview'}
              </h2>
              {report && categoryMeta && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${categoryMeta.bgColor} ${categoryMeta.color}`}
                >
                  {categoryMeta.label}
                </span>
              )}
            </div>
            <p className="text-[11px] text-silver-mist mt-0.5">
              {previewData.totalRows.toLocaleString()} total rows
              {previewData.sampleNote && ` · ${previewData.sampleNote}`}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            {(['pdf', 'excel', 'csv'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-cloud dark:border-nebula-purple/40 text-silver-mist hover:text-celestial-indigo hover:border-celestial-indigo/40 transition-colors"
              >
                <Download className="w-3 h-3" />
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & column controls */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10">
        <div className="flex-1 relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver-mist" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Filter rows..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/40 bg-transparent text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-1 focus:ring-celestial-indigo/40"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowColumnPanel(!showColumnPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showColumnPanel
                ? 'border-celestial-indigo text-celestial-indigo bg-celestial-indigo/5'
                : 'border-cloud dark:border-nebula-purple/40 text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Columns
            <span className="text-[10px] bg-celestial-indigo/10 text-celestial-indigo px-1 rounded">
              {visibleFields.size}/{previewData.columns.length}
            </span>
          </button>

          {showColumnPanel && (
            <ColumnPanel
              columns={previewData.columns}
              visibleFields={visibleFields}
              onToggle={toggleColumn}
              onClose={() => setShowColumnPanel(false)}
            />
          )}
        </div>

        {filterQuery && (
          <p className="text-xs text-silver-mist">
            {sortedRows.length} of {previewData.rows.length} rows
          </p>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto print:overflow-visible">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-pearl dark:bg-deep-cosmos/50 sticky top-0">
              {visibleColumns.map((col) => (
                <th
                  key={col.field}
                  className={`px-3 py-2.5 text-left font-semibold text-silver-mist whitespace-nowrap ${
                    col.sortable
                      ? 'cursor-pointer hover:text-ink-black dark:hover:text-pearl select-none'
                      : ''
                  }`}
                  onClick={col.sortable ? () => handleSort(col.field) : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable &&
                      (sort.field === col.field ? (
                        sort.direction === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-celestial-indigo" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-celestial-indigo" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, i) => (
              <tr
                key={i}
                className="border-t border-cloud/50 dark:border-nebula-purple/10 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/30 transition-colors"
              >
                {visibleColumns.map((col) => (
                  <td
                    key={col.field}
                    className="px-3 py-2.5 text-ink-black dark:text-pearl whitespace-nowrap"
                  >
                    {formatCell(row[col.field], col.type)}
                  </td>
                ))}
              </tr>
            ))}

            {paginatedRows.length === 0 && (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-3 py-10 text-center text-silver-mist"
                >
                  No rows match your filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-cloud dark:border-nebula-purple/20">
          <p className="text-[11px] text-silver-mist">
            Page {page} of {totalPages} ({sortedRows.length.toLocaleString()} rows)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setPage(pg)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  pg === page
                    ? 'bg-celestial-indigo text-white'
                    : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportViewer;
