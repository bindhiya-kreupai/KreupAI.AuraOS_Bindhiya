'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, Minus } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type ColumnAlign = 'left' | 'center' | 'right';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  align?: ColumnAlign;
  sortable?: boolean;
  hideOnMobile?: boolean;
  /** Custom cell renderer */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** Mobile card label override (defaults to column label) */
  mobileLabel?: string;
  /** If true, renders as the primary card title on mobile */
  isPrimaryMobile?: boolean;
  /** If true, renders as the card subtitle on mobile */
  isSecondaryMobile?: boolean;
}

export interface ResponsiveTableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: string | ((row: T) => string);
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  striped?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  mobileBreakpoint?: 'sm' | 'md' | 'lg';
  cardClassName?: string;
  className?: string;
}

type SortConfig = { key: string; dir: 'asc' | 'desc' } | null;

// ── Helpers ────────────────────────────────────────────────────────────────────

function getRowKey<T extends Record<string, unknown>>(
  row: T,
  key: string | ((r: T) => string)
): string {
  return typeof key === 'function' ? key(row) : String(row[key] ?? '');
}

function getCellValue<T extends Record<string, unknown>>(
  row: T,
  col: TableColumn<T>
): React.ReactNode {
  const raw = row[col.key];
  if (col.render) return col.render(raw, row);
  if (raw === null || raw === undefined) return <Minus className="w-3 h-3 text-slate-300" />;
  return String(raw);
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ResponsiveTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  striped = false,
  compact = false,
  stickyHeader = false,
  mobileBreakpoint = 'md',
  cardClassName = '',
  className = '',
}: ResponsiveTableProps<T>) {
  const [sort, setSort] = useState<SortConfig>(null);

  const handleSort = (key: string) => {
    setSort((s) =>
      s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sort) return 0;
    const av = a[sort.key];
    const bv = b[sort.key];
    if (av === bv) return 0;
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''));
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: TableColumn<T> }) => {
    if (!col.sortable) return null;
    if (sort?.key !== col.key) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sort.dir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-indigo-500" />
    ) : (
      <ChevronDown className="w-3 h-3 text-indigo-500" />
    );
  };

  const mobileHidden = `${mobileBreakpoint}:table-cell`;

  // ── Loading Skeleton ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={`space-y-2 ${mobileBreakpoint}:hidden`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl h-20" />
        ))}
      </div>
    );
  }

  // ── Empty State ──────────────────────────────────────────────────────────────

  if (sortedData.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const primaryCol = columns.find((c) => c.isPrimaryMobile) ?? columns[0];
  const secondaryCol = columns.find((c) => c.isSecondaryMobile);
  const mobileVisibleCols = columns.filter(
    (c) => !c.hideOnMobile && !c.isPrimaryMobile && !c.isSecondaryMobile
  );

  return (
    <div className={className}>
      {/* ── Mobile card view ──────────────────────────────────────────────── */}
      <div className={`space-y-2 ${mobileBreakpoint}:hidden`}>
        {sortedData.map((row) => {
          const key = getRowKey(row, rowKey);
          return (
            <div
              key={key}
              onClick={() => onRowClick?.(row)}
              className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all ${
                onRowClick
                  ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-[0.99]'
                  : ''
              } ${cardClassName}`}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {getCellValue(row, primaryCol)}
                  </div>
                  {secondaryCol && (
                    <div className="text-xs text-slate-400 mt-0.5 truncate">
                      {getCellValue(row, secondaryCol)}
                    </div>
                  )}
                </div>
                {onRowClick && (
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                )}
              </div>

              {/* Card body: remaining visible columns */}
              {mobileVisibleCols.length > 0 && (
                <div
                  className={`grid grid-cols-2 gap-x-4 gap-y-2 px-4 pb-4 ${
                    mobileVisibleCols.length === 1 ? 'grid-cols-1' : ''
                  }`}
                >
                  {mobileVisibleCols.map((col) => (
                    <div key={col.key}>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">
                        {col.mobileLabel ?? col.label}
                      </p>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                        {getCellValue(row, col)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop table view ────────────────────────────────────────────── */}
      <div
        className={`hidden ${mobileBreakpoint}:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={`bg-slate-50 dark:bg-slate-800/50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}
            >
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`
                      px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide
                      ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                      ${col.sortable ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none' : ''}
                      ${col.hideOnMobile ? `hidden ${mobileHidden}` : ''}
                    `}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'flex-row-reverse' : ''}`}
                    >
                      {col.label}
                      <SortIcon col={col} />
                    </div>
                  </th>
                ))}
                {onRowClick && <th className="w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedData.map((row, rowIdx) => {
                const key = getRowKey(row, rowKey);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={`
                      transition-colors
                      ${onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''}
                      ${striped && rowIdx % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}
                    `}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`
                          ${compact ? 'px-5 py-2.5' : 'px-5 py-4'} text-sm
                          ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                          ${col.hideOnMobile ? `hidden ${mobileHidden}` : ''}
                          text-slate-700 dark:text-slate-300
                        `}
                      >
                        {getCellValue(row, col)}
                      </td>
                    ))}
                    {onRowClick && (
                      <td className="pr-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-300 inline-block" />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
