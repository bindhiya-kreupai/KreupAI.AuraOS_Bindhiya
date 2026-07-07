'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  FileText,
  Download,
  Table,
  PieChart,
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  Minus,
} from 'lucide-react';
import { APIClient } from '@/lib/api-client';
import { PayrollAnalyticsService } from '../services';
import type { PayrollStats } from '../types';

// ---------------------------------------------------------------------------
// Types matching GET /api/payroll/reports?type=...
// ---------------------------------------------------------------------------

type ReportType = 'salary-register' | 'tax-liability' | 'variance' | 'cost-center';

interface ReportEnvelope {
  success: boolean;
  data: { name: string; description: string; data: Record<string, unknown> } | null;
  meta?: { month: string };
}

interface VarianceData {
  currentMonth: string;
  previousMonth: string;
  currentTotal: number;
  previousTotal: number;
  variance: number;
  variancePercent: number;
  currentGross: number;
  previousGross: number;
  currentEmployees: number;
  previousEmployees: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const currentMonthDefault = new Date().toISOString().slice(0, 7);

function fmtMoney(n: number): string {
  return `$${Number(n || 0).toLocaleString()}`;
}

/** Escape a value for safe inclusion in a CSV cell. */
function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Trigger a client-side download of a text blob. */
function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Flatten a report's real returned `data` object into CSV rows.
 * Rows with array values (e.g. salary-register employees) are expanded into a
 * proper table; scalar fields are emitted as label/value pairs.
 */
function buildCsv(report: { name: string; data: Record<string, unknown> }): string {
  const lines: string[] = [];
  lines.push(csvCell(report.name));
  lines.push('');

  const arrayEntries = Object.entries(report.data).filter(([, v]) => Array.isArray(v));
  const scalarEntries = Object.entries(report.data).filter(
    ([, v]) => !Array.isArray(v) && (typeof v !== 'object' || v === null)
  );
  const objectEntries = Object.entries(report.data).filter(
    ([, v]) => !Array.isArray(v) && typeof v === 'object' && v !== null
  );

  // Scalar summary fields
  if (scalarEntries.length > 0) {
    lines.push('Field,Value');
    for (const [k, v] of scalarEntries) {
      lines.push(`${csvCell(k)},${csvCell(v)}`);
    }
    lines.push('');
  }

  // Nested object fields (e.g. totals, regimeBreakdown) flattened one level
  for (const [key, obj] of objectEntries) {
    lines.push(csvCell(key));
    lines.push('Field,Value');
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      lines.push(`${csvCell(k)},${csvCell(v)}`);
    }
    lines.push('');
  }

  // Array tables (e.g. employees)
  for (const [key, arr] of arrayEntries) {
    const rows = arr as Array<Record<string, unknown>>;
    lines.push(csvCell(key));
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      lines.push(headers.map(csvCell).join(','));
      for (const row of rows) {
        lines.push(headers.map((h) => csvCell(row[h])).join(','));
      }
    } else {
      lines.push('(no rows)');
    }
    lines.push('');
  }

  return lines.join('\n');
}

/** Build a simple printable HTML document from the real report data. */
function buildPrintableHtml(
  report: { name: string; description: string; data: Record<string, unknown> },
  month: string
): string {
  const sections: string[] = [];

  const arrayEntries = Object.entries(report.data).filter(([, v]) => Array.isArray(v));
  const scalarEntries = Object.entries(report.data).filter(
    ([, v]) => !Array.isArray(v) && (typeof v !== 'object' || v === null)
  );
  const objectEntries = Object.entries(report.data).filter(
    ([, v]) => !Array.isArray(v) && typeof v === 'object' && v !== null
  );

  const esc = (v: unknown) =>
    String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  if (scalarEntries.length > 0) {
    sections.push(
      `<table><tbody>${scalarEntries
        .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
        .join('')}</tbody></table>`
    );
  }

  for (const [key, obj] of objectEntries) {
    sections.push(`<h2>${esc(key)}</h2>`);
    sections.push(
      `<table><tbody>${Object.entries(obj as Record<string, unknown>)
        .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
        .join('')}</tbody></table>`
    );
  }

  for (const [key, arr] of arrayEntries) {
    const rows = arr as Array<Record<string, unknown>>;
    sections.push(`<h2>${esc(key)}</h2>`);
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      sections.push(
        `<table><thead><tr>${headers
          .map((h) => `<th>${esc(h)}</th>`)
          .join('')}</tr></thead><tbody>${rows
          .map((row) => `<tr>${headers.map((h) => `<td>${esc(row[h])}</td>`).join('')}</tr>`)
          .join('')}</tbody></table>`
      );
    } else {
      sections.push('<p>(no rows)</p>');
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(report.name)} — ${esc(month)}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 32px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #64748b; font-size: 13px; margin: 0 0 24px; }
  h2 { font-size: 15px; margin: 24px 0 8px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 16px; font-size: 13px; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; }
  thead th { background: #f8fafc; }
  tbody th { background: #f8fafc; width: 40%; }
</style>
</head>
<body>
<h1>${esc(report.name)}</h1>
<p class="sub">${esc(report.description)} &middot; Month: ${esc(month)}</p>
${sections.join('\n')}
<script>window.onload = function () { window.print(); };</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const REPORTS: Array<{ type: ReportType; name: string; desc: string; icon: typeof Table }> = [
  {
    type: 'salary-register',
    name: 'Salary Register',
    desc: 'Detailed monthly salary breakdown per employee.',
    icon: Table,
  },
  {
    type: 'tax-liability',
    name: 'Tax Liability Report',
    desc: 'Summary of TDS deducted and liable payments.',
    icon: FileText,
  },
  {
    type: 'variance',
    name: 'Variance Report',
    desc: 'Month-on-month comparison of payroll costs.',
    icon: BarChart,
  },
  {
    type: 'cost-center',
    name: 'Cost Center Distribution',
    desc: 'Payroll cost allocation by department/project.',
    icon: PieChart,
  },
];

export default function PayrollReportsPage() {
  const [stats, setStats] = useState<PayrollStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(currentMonthDefault);

  // Per-card busy state: `${type}:${format}`
  const [busy, setBusy] = useState<string | null>(null);
  const [cardError, setCardError] = useState<Record<string, string | null>>({});

  // Real aggregate variance section
  const [variance, setVariance] = useState<VarianceData | null>(null);
  const [varianceLoading, setVarianceLoading] = useState(false);
  const [varianceError, setVarianceError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await PayrollAnalyticsService.getStats();
        setStats(result);
      } catch (error) {
        console.error('Error loading payroll stats:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchReport = useCallback(
    async (type: ReportType): Promise<ReportEnvelope['data']> => {
      const res = await APIClient.get<ReportEnvelope>('/payroll/reports', { type, month });
      if (!res.success || !res.data) {
        throw new Error('Report unavailable for the selected month');
      }
      return res.data;
    },
    [month]
  );

  const loadVariance = useCallback(async () => {
    setVarianceLoading(true);
    setVarianceError(null);
    try {
      const data = await fetchReport('variance');
      setVariance((data?.data as unknown as VarianceData) ?? null);
    } catch (error) {
      setVariance(null);
      setVarianceError(error instanceof Error ? error.message : 'Failed to load variance data');
    } finally {
      setVarianceLoading(false);
    }
  }, [fetchReport]);

  useEffect(() => {
    loadVariance();
  }, [loadVariance]);

  const handleDownload = useCallback(
    async (type: ReportType, format: 'pdf' | 'excel') => {
      const key = `${type}:${format}`;
      setBusy(key);
      setCardError((prev) => ({ ...prev, [type]: null }));
      try {
        const report = await fetchReport(type);
        if (!report) throw new Error('No report data returned');

        if (format === 'excel') {
          const csv = buildCsv(report);
          downloadBlob(csv, `${type}-${month}.csv`, 'text/csv;charset=utf-8;');
        } else {
          const html = buildPrintableHtml(report, month);
          const win = window.open('', '_blank');
          if (win) {
            win.document.write(html);
            win.document.close();
          } else {
            // Popup blocked — fall back to an HTML file download.
            downloadBlob(html, `${type}-${month}.html`, 'text/html;charset=utf-8;');
          }
        }
      } catch (error) {
        setCardError((prev) => ({
          ...prev,
          [type]: error instanceof Error ? error.message : 'Download failed. Please retry.',
        }));
      } finally {
        setBusy(null);
      }
    },
    [fetchReport, month]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  const headcountDelta = variance ? variance.currentEmployees - variance.previousEmployees : 0;

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart className="w-6 h-6 text-indigo-500" />
            Payroll Reports
          </h1>
          <p className="text-slate-500 text-sm">Comprehensive reports for finance and auditing.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="report-month" className="text-sm font-medium text-slate-500">
            Month
          </label>
          <input
            id="report-month"
            type="month"
            value={month}
            max={currentMonthDefault}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase">Employees</div>
                <div className="text-xl font-bold">{stats.totalEmployees}</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase">Monthly Cost</div>
                <div className="text-xl font-bold">
                  ${stats.monthlyPayrollCost.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase">Avg Salary</div>
                <div className="text-xl font-bold">${stats.averageSalary.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase">Pending Returns</div>
                <div className="text-xl font-bold">{stats.pendingStatutoryReturns}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real aggregate variance section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg">Month-on-Month Variance</h3>
          </div>
          {variance && (
            <span className="text-xs text-slate-500">
              {variance.previousMonth} <span className="mx-1">→</span> {variance.currentMonth}
            </span>
          )}
        </div>

        {varianceLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : varianceError ? (
          <div className="flex items-center gap-2 px-6 py-8 text-sm text-rose-600">
            <AlertTriangle className="w-4 h-4" />
            {varianceError}
            <button
              onClick={loadVariance}
              className="ml-2 underline font-medium hover:text-rose-700"
            >
              Retry
            </button>
          </div>
        ) : variance ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 dark:bg-slate-800">
            <div className="bg-white dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-500 font-bold uppercase">Current Net Total</p>
              <p className="text-xl font-bold mt-1">{fmtMoney(variance.currentTotal)}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Gross {fmtMoney(variance.currentGross)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-500 font-bold uppercase">Previous Net Total</p>
              <p className="text-xl font-bold mt-1">{fmtMoney(variance.previousTotal)}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Gross {fmtMoney(variance.previousGross)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-500 font-bold uppercase">Variance</p>
              <p
                className={`text-xl font-bold mt-1 flex items-center gap-1 ${
                  variance.variance > 0
                    ? 'text-emerald-600'
                    : variance.variance < 0
                      ? 'text-rose-600'
                      : 'text-slate-500'
                }`}
              >
                {variance.variance > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : variance.variance < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                {variance.variance >= 0 ? '+' : '-'}
                {fmtMoney(Math.abs(variance.variance))}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {variance.variancePercent >= 0 ? '+' : ''}
                {variance.variancePercent.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4">
              <p className="text-xs text-slate-500 font-bold uppercase">Headcount</p>
              <p className="text-xl font-bold mt-1">
                {variance.currentEmployees}
                {headcountDelta !== 0 && (
                  <span
                    className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      headcountDelta > 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {headcountDelta > 0 ? `+${headcountDelta}` : headcountDelta}
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">was {variance.previousEmployees}</p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-8 text-sm text-slate-500">No payroll run found for {month}.</div>
        )}
      </div>

      {/* Report cards with real downloads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {REPORTS.map((report) => {
          const pdfBusy = busy === `${report.type}:pdf`;
          const excelBusy = busy === `${report.type}:excel`;
          const err = cardError[report.type];
          return (
            <div
              key={report.type}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{report.name}</h4>
                  <p className="text-sm text-slate-500 mb-4">{report.desc}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(report.type, 'pdf')}
                      disabled={pdfBusy || excelBusy}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pdfBusy ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      PDF
                    </button>
                    <button
                      onClick={() => handleDownload(report.type, 'excel')}
                      disabled={pdfBusy || excelBusy}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {excelBusy ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      Excel
                    </button>
                  </div>
                  {err && (
                    <p className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {err}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
