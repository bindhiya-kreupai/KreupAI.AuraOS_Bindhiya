'use client';

/**
 * @module ValidationStep
 * @description Step 3 of BulkImportWizard — row-by-row validation results
 *   with error highlighting, fix suggestions, and pass/fail summary.
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import {
  type ColumnMappingEntry,
  type ImportEntityType,
  type ParsedFile,
  type ValidationReport,
  type RowValidationError,
  validateRows,
} from '@/services/bulkImportService';

interface ValidationStepProps {
  parsedFile: ParsedFile;
  entityType: ImportEntityType;
  columnMappings: ColumnMappingEntry[];
  onValidationComplete: (report: ValidationReport) => void;
}

export default function ValidationStep({
  parsedFile,
  entityType,
  columnMappings,
  onValidationComplete,
}: ValidationStepProps) {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showErrors, setShowErrors] = useState(true);
  const [showWarnings, setShowWarnings] = useState(false);
  const [errorPage, setErrorPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Offload to next tick so the spinner renders before the sync work
    setTimeout(() => {
      if (cancelled) return;
      const result = validateRows(parsedFile.rows, entityType, columnMappings);
      setReport(result);
      onValidationComplete(result);
      setLoading(false);
    }, 60);

    return () => {
      cancelled = true;
    };
  }, [parsedFile, entityType, columnMappings]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="w-8 h-8 text-celestial-indigo animate-spin" />
        <p className="text-sm text-silver-mist">
          Validating {parsedFile.totalRows.toLocaleString()} rows…
        </p>
      </div>
    );
  }

  if (!report) return null;

  const paginatedErrors = report.errors.slice(errorPage * PAGE_SIZE, (errorPage + 1) * PAGE_SIZE);
  const totalErrorPages = Math.ceil(report.errors.length / PAGE_SIZE);

  const passRate =
    report.totalRows > 0 ? Math.round((report.validRows / report.totalRows) * 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Validation Results</h3>
        <p className="text-sm text-silver-mist mt-0.5">
          Review errors and warnings before importing.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          icon={<CheckCircle2 className="w-5 h-5 text-aurora-green" />}
          value={report.validRows.toLocaleString()}
          label="Valid Rows"
          colorClass="bg-emerald-50 dark:bg-emerald-900/20 border-aurora-green/30"
          valueClass="text-emerald-600"
        />
        <SummaryCard
          icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
          value={report.errorRows.toLocaleString()}
          label="Rows with Errors"
          colorClass="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/30"
          valueClass="text-rose-600"
        />
        <SummaryCard
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          value={report.warningRows.toLocaleString()}
          label="Rows with Warnings"
          colorClass="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30"
          valueClass="text-amber-600"
        />
        <SummaryCard
          icon={<span className="text-lg font-black text-celestial-indigo">{passRate}%</span>}
          value={report.totalRows.toLocaleString()}
          label="Total Rows"
          colorClass="bg-celestial-indigo/10 border-celestial-indigo/30"
          valueClass="text-celestial-indigo"
        />
      </div>

      {/* Pass rate bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-silver-mist mb-1">
          <span>Pass rate</span>
          <span className="font-semibold text-ink-black dark:text-pearl">{passRate}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              passRate >= 90 ? 'bg-aurora-green' : passRate >= 70 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
            style={{ width: `${passRate}%` }}
          />
        </div>
      </div>

      {/* Errors accordion */}
      {report.errors.length > 0 && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-800/30 overflow-hidden">
          <button
            onClick={() => setShowErrors((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-3 bg-rose-50 dark:bg-rose-900/10 text-sm font-semibold text-rose-700 dark:text-rose-400"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Errors ({report.errors.length})
            </span>
            {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showErrors && (
            <div className="divide-y divide-rose-100 dark:divide-rose-900/20">
              {paginatedErrors.map((err, i) => (
                <ErrorRow key={i} item={err} colorScheme="error" />
              ))}
              {totalErrorPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-stellar-blue text-xs text-silver-mist">
                  <span>
                    Showing {errorPage * PAGE_SIZE + 1}–
                    {Math.min((errorPage + 1) * PAGE_SIZE, report.errors.length)} of{' '}
                    {report.errors.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      disabled={errorPage === 0}
                      onClick={() => setErrorPage((p) => p - 1)}
                      className="px-2 py-0.5 rounded border border-cloud dark:border-nebula-purple/30 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-deep-cosmos"
                    >
                      Prev
                    </button>
                    <button
                      disabled={errorPage >= totalErrorPages - 1}
                      onClick={() => setErrorPage((p) => p + 1)}
                      className="px-2 py-0.5 rounded border border-cloud dark:border-nebula-purple/30 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-deep-cosmos"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Warnings accordion */}
      {report.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/30 overflow-hidden">
          <button
            onClick={() => setShowWarnings((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/10 text-sm font-semibold text-amber-700 dark:text-amber-400"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings ({report.warnings.length})
            </span>
            {showWarnings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showWarnings && (
            <div className="divide-y divide-amber-100 dark:divide-amber-900/20">
              {report.warnings.map((w, i) => (
                <ErrorRow key={i} item={w} colorScheme="warning" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* All good */}
      {report.valid && (
        <div className="flex items-center gap-3 p-4 bg-aurora-green/10 border border-aurora-green/30 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-aurora-green shrink-0" />
          <div>
            <p className="text-sm font-semibold text-aurora-green">All rows are valid</p>
            <p className="text-xs text-silver-mist mt-0.5">
              Ready to import {report.validRows.toLocaleString()} rows into AuraOS.
            </p>
          </div>
        </div>
      )}

      {!report.valid && (
        <p className="text-xs text-silver-mist">
          Rows with errors will be skipped. Only {report.validRows.toLocaleString()} valid rows will
          be imported. Fix errors in your file and re-upload if you need full data.
        </p>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SummaryCard({
  icon,
  value,
  label,
  colorClass,
  valueClass,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  colorClass: string;
  valueClass: string;
}) {
  return (
    <div className={`p-3 rounded-xl border text-center ${colorClass}`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <div className={`text-xl font-black ${valueClass}`}>{value}</div>
      <div className="text-xs text-silver-mist mt-0.5">{label}</div>
    </div>
  );
}

function ErrorRow({
  item,
  colorScheme,
}: {
  item: RowValidationError;
  colorScheme: 'error' | 'warning';
}) {
  const bg =
    colorScheme === 'error' ? 'bg-white dark:bg-stellar-blue' : 'bg-white dark:bg-stellar-blue';
  const rowBadge =
    colorScheme === 'error'
      ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600';

  return (
    <div className={`px-4 py-2.5 ${bg}`}>
      <div className="flex items-start gap-3">
        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${rowBadge}`}>
          Row {item.row}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink-black dark:text-pearl">
            <span className="font-semibold">{item.field}:</span> {item.message}
            {item.value && (
              <code className="ml-1 text-[10px] bg-gray-100 dark:bg-deep-cosmos px-1 py-0.5 rounded font-mono">
                {item.value.slice(0, 40)}
                {item.value.length > 40 ? '…' : ''}
              </code>
            )}
          </p>
          {item.suggestion && (
            <p className="flex items-center gap-1 text-[10px] text-silver-mist mt-0.5">
              <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
              {item.suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
