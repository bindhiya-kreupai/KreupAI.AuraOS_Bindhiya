'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Download, RefreshCw, Table, BarChart3, Loader2 } from 'lucide-react';

interface PreviewColumn {
  id: string;
  name: string;
  type: string;
  category: string;
}

interface ReportPreviewProps {
  dataSource?: string;
  columns?: string[];
  chartType?: string;
}

function formatValue(value: unknown, type: string): string {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'currency') return `$${Number(value).toLocaleString()}`;
  if (type === 'number') return Number(value).toLocaleString();
  if (type === 'date') {
    const d = new Date(String(value));
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
  return String(value);
}

export function ReportPreview({ dataSource, columns, chartType = 'table' }: ReportPreviewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>(
    chartType === 'table' ? 'table' : 'chart'
  );
  const [cols, setCols] = useState<PreviewColumn[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!dataSource) {
      setCols([]);
      setRows([]);
      setTotalRows(0);
      return;
    }
    setLoading(true);
    setError(null);
    fetch('/api/v1/reports/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataSource, columns: columns ?? [], limit: 25 }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCols(json.data.columns || []);
          setRows(json.data.rows || []);
          setTotalRows(json.data.totalRows || 0);
        } else {
          setError(json.error?.message || 'Failed to load preview');
        }
      })
      .catch(() => setError('Failed to load preview'))
      .finally(() => setLoading(false));
  }, [dataSource, columns]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownloadCsv = () => {
    if (cols.length === 0 || rows.length === 0) return;
    const header = cols.map((c) => `"${c.name}"`).join(',');
    const body = rows
      .map((row) => cols.map((c) => `"${String(row[c.id] ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataSource || 'report'}-preview.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Chart: group by first text column, count occurrences.
  const chartData = (() => {
    const groupCol = cols.find((c) => c.type === 'text');
    if (!groupCol) return [];
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const key = String(row[groupCol.id] ?? '—');
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  })();
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map((d) => d.value)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-celestial-indigo" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">Report Preview</h3>
          <span className="text-xs text-silver-mist">
            ({totalRows.toLocaleString()} total rows)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-deep-cosmos rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                  : 'text-silver-mist'
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`p-1.5 rounded ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                  : 'text-silver-mist'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={load}
            className="p-1.5 text-silver-mist hover:text-celestial-indigo rounded transition-colors"
            aria-label="Refresh preview"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-celestial-indigo animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      ) : !dataSource ? (
        <p className="text-sm text-silver-mist py-8 text-center">
          Select a data source and columns to preview.
        </p>
      ) : viewMode === 'table' ? (
        <div className="border border-cloud dark:border-nebula-purple/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-deep-cosmos">
                  {cols.map((col) => (
                    <th
                      key={col.id}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-silver-mist whitespace-nowrap"
                    >
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/50">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={Math.max(cols.length, 1)}
                      className="px-4 py-8 text-center text-silver-mist"
                    >
                      No data available for this data source
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-deep-cosmos/50">
                      {cols.map((col) => (
                        <td
                          key={col.id}
                          className="px-4 py-2.5 text-sm text-ink-black dark:text-pearl whitespace-nowrap"
                        >
                          {formatValue(row[col.id], col.type)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border border-cloud dark:border-nebula-purple/50 rounded-lg p-6">
          {chartData.length === 0 ? (
            <p className="text-sm text-silver-mist text-center py-4">
              No groupable column available for chart view
            </p>
          ) : (
            <div className="space-y-3">
              {chartData.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-ink-black dark:text-pearl w-32 truncate">
                    {item.label}
                  </span>
                  <div className="flex-1 h-6 bg-slate-50 dark:bg-deep-cosmos rounded-full overflow-hidden">
                    <div
                      className="h-full bg-celestial-indigo/70 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    >
                      <span className="text-[10px] font-medium text-white">{item.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <span className="text-xs text-silver-mist">Export:</span>
        <button
          onClick={handleDownloadCsv}
          disabled={rows.length === 0}
          className="ml-auto flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 disabled:opacity-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Download CSV
        </button>
      </div>
    </div>
  );
}
