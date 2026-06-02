'use client';

/**
 * @module ImportProgress (BulkImport)
 * @description Step 5 of BulkImportWizard — real-time progress bar with
 *   row counts, success/error stats, and a completion summary.
 */

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Download, RefreshCw, XCircle } from 'lucide-react';
import type { ImportJobResult, ValidationReport } from '@/services/bulkImportService';
import type { ImportEntityType } from '@/services/bulkImportService';

interface ImportProgressProps {
  validationReport: ValidationReport;
  entityType: ImportEntityType;
  onComplete?: (result: ImportJobResult) => void;
  onRetry?: () => void;
}

export default function ImportProgress({
  validationReport,
  entityType,
  onComplete,
  onRetry,
}: ImportProgressProps) {
  const [progress, setProgress] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [result, setResult] = useState<ImportJobResult | null>(null);
  const [_running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const totalRows = validationReport.cleanRows.length;

  useEffect(() => {
    if (startedRef.current || totalRows === 0) return;
    startedRef.current = true;
    runImport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runImport = async () => {
    setRunning(true);
    setProgress(0);
    setProcessed(0);
    setResult(null);
    setError(null);

    try {
      const { executeBulkImport } = await import('@/services/bulkImportService');
      const jobResult = await executeBulkImport(
        entityType,
        validationReport.cleanRows,
        (done, total) => {
          setProcessed(done);
          setProgress(Math.round((done / total) * 100));
        }
      );
      setProgress(100);
      setProcessed(totalRows);
      setResult(jobResult);
      onComplete?.(jobResult);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Import failed unexpectedly.');
    } finally {
      setRunning(false);
    }
  };

  const isComplete = result !== null;
  const isSuccess = result?.status === 'completed';
  const isPartial = result?.status === 'partial';
  const isFailed = result?.status === 'failed' || !!error;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const s = (ms / 1000).toFixed(1);
    return `${s}s`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-ink-black dark:text-pearl">
          {isComplete
            ? isSuccess
              ? 'Import Complete!'
              : isPartial
                ? 'Import Finished with Errors'
                : 'Import Failed'
            : 'Importing Data…'}
        </h3>
        <p className="text-sm text-silver-mist mt-0.5">
          {isComplete
            ? `Processed ${result?.processedRows.toLocaleString() ?? totalRows.toLocaleString()} rows into ${entityType.replace('-', ' ')}.`
            : `Importing ${totalRows.toLocaleString()} rows into ${entityType.replace('-', ' ')}…`}
        </p>
      </div>

      {/* Progress section */}
      <div className="space-y-3">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-ink-black dark:text-pearl">
              {isComplete ? 'Done' : 'Processing…'}
            </span>
            <span
              className={`font-bold ${
                isSuccess
                  ? 'text-aurora-green'
                  : isFailed
                    ? 'text-rose-500'
                    : 'text-celestial-indigo'
              }`}
            >
              {progress}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isSuccess
                  ? 'bg-aurora-green'
                  : isFailed
                    ? 'bg-rose-500'
                    : isPartial
                      ? 'bg-amber-400'
                      : 'bg-celestial-indigo'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Row counters */}
        <div className="flex items-center gap-2 text-xs text-silver-mist">
          {!isComplete ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-celestial-indigo" />
              <span>
                {processed.toLocaleString()} / {totalRows.toLocaleString()} rows processed
              </span>
            </>
          ) : (
            <>
              {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-aurora-green" />}
              {isPartial && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
              {isFailed && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
              <span>{processed.toLocaleString()} rows processed</span>
            </>
          )}
        </div>
      </div>

      {/* Result stats */}
      {isComplete && result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Imported"
            value={result.successRows.toLocaleString()}
            colorClass="text-aurora-green"
            bgClass="bg-aurora-green/10 border-aurora-green/30"
          />
          <StatCard
            label="Failed"
            value={result.failedRows.toLocaleString()}
            colorClass="text-rose-600"
            bgClass="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/30"
          />
          <StatCard
            label="Total"
            value={result.totalRows.toLocaleString()}
            colorClass="text-ink-black dark:text-pearl"
            bgClass="bg-gray-100 dark:bg-deep-cosmos border-cloud dark:border-nebula-purple/30"
          />
          {result.durationMs !== undefined && (
            <StatCard
              label="Duration"
              value={formatDuration(result.durationMs)}
              colorClass="text-celestial-indigo"
              bgClass="bg-celestial-indigo/10 border-celestial-indigo/30"
            />
          )}
        </div>
      )}

      {/* Error list */}
      {isComplete && result && result.errors.length > 0 && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-800/30 overflow-hidden">
          <div className="px-4 py-3 bg-rose-50 dark:bg-rose-900/10 text-sm font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Import Errors ({result.errors.length})
          </div>
          <div className="divide-y divide-rose-100 dark:divide-rose-900/20 max-h-48 overflow-y-auto">
            {result.errors.slice(0, 20).map((e, i) => (
              <div key={i} className="px-4 py-2 text-xs text-rose-700 dark:text-rose-400">
                {e}
              </div>
            ))}
            {result.errors.length > 20 && (
              <div className="px-4 py-2 text-xs text-silver-mist">
                …and {result.errors.length - 20} more errors
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top-level error */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 rounded-lg">
          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      {isComplete && (
        <div className="flex flex-wrap gap-3">
          {(isFailed || isPartial) && onRetry && (
            <button
              onClick={() => {
                startedRef.current = false;
                runImport();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Failed Rows
            </button>
          )}
          {result && result.failedRows > 0 && (
            <button
              onClick={() => downloadErrorReport(result)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium text-ink-black dark:text-pearl hover:bg-gray-50 dark:hover:bg-deep-cosmos transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Error Report
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  colorClass,
  bgClass,
}: {
  label: string;
  value: string;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className={`p-3 rounded-xl border text-center ${bgClass}`}>
      <div className={`text-xl font-black ${colorClass}`}>{value}</div>
      <div className="text-xs text-silver-mist mt-0.5">{label}</div>
    </div>
  );
}

function downloadErrorReport(result: ImportJobResult) {
  const lines = [
    'Error Report',
    `Job ID: ${result.jobId}`,
    `Entity: ${result.entityType}`,
    '',
    ...result.errors,
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `import-errors-${result.jobId}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
