'use client';

/**
 * @module ImportPreview
 * @description Step 4 of BulkImportWizard — preview the first 50 valid rows
 *   in a scrollable table before executing the import.
 */

import React, { useMemo, useState } from 'react';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ValidationReport } from '@/services/bulkImportService';
import type { ImportEntityType } from '@/services/bulkImportService';

const PREVIEW_LIMIT = 50;
const PAGE_SIZE = 15;

interface ImportPreviewProps {
  validationReport: ValidationReport;
  entityType: ImportEntityType;
}

export default function ImportPreview({ validationReport, entityType }: ImportPreviewProps) {
  const [page, setPage] = useState(0);

  const previewRows = useMemo(
    () => validationReport.cleanRows.slice(0, PREVIEW_LIMIT),
    [validationReport.cleanRows]
  );

  const columns = useMemo(() => {
    if (previewRows.length === 0) return [];
    return Object.keys(previewRows[0]);
  }, [previewRows]);

  const totalPages = Math.ceil(previewRows.length / PAGE_SIZE);
  const pageRows = previewRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const totalImportRows = validationReport.cleanRows.length;
  const skippedRows = validationReport.errorRows;

  if (previewRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Eye className="w-10 h-10 text-silver-mist" />
        <p className="text-sm font-medium text-silver-mist">No valid rows to preview.</p>
        <p className="text-xs text-silver-mist">
          Go back and fix validation errors before proceeding.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Preview Import</h3>
        <p className="text-sm text-silver-mist mt-0.5">
          Showing the first {Math.min(PREVIEW_LIMIT, previewRows.length)} valid rows of{' '}
          {totalImportRows.toLocaleString()} that will be imported into{' '}
          <span className="font-semibold capitalize">{entityType.replace('-', ' ')}</span>.
        </p>
      </div>

      {/* Summary row */}
      <div className="flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-aurora-green/10 border border-aurora-green/30 rounded-full">
          <span className="font-bold text-aurora-green">{totalImportRows.toLocaleString()}</span>
          <span className="text-silver-mist">rows will be imported</span>
        </div>
        {skippedRows > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-full">
            <span className="font-bold text-rose-600">{skippedRows.toLocaleString()}</span>
            <span className="text-silver-mist">rows skipped (errors)</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-deep-cosmos rounded-full">
          <span className="font-bold text-ink-black dark:text-pearl">{columns.length}</span>
          <span className="text-silver-mist">fields</span>
        </div>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto rounded-xl border border-cloud dark:border-nebula-purple/30">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-deep-cosmos border-b border-cloud dark:border-nebula-purple/30">
              <th className="py-2.5 px-3 text-left font-semibold text-silver-mist w-10">#</th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="py-2.5 px-3 text-left font-semibold text-ink-black dark:text-pearl capitalize whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
            {pageRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-gray-50/60 dark:hover:bg-deep-cosmos/40 transition-colors"
              >
                <td className="py-2 px-3 text-silver-mist font-mono">
                  {page * PAGE_SIZE + rowIdx + 1}
                </td>
                {columns.map((col) => (
                  <td
                    key={col}
                    className="py-2 px-3 text-ink-black dark:text-pearl max-w-[160px] truncate"
                    title={row[col]}
                  >
                    {row[col] || <span className="text-silver-mist italic">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-silver-mist">
          <span>
            Showing rows {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, previewRows.length)} of {previewRows.length} preview
            rows
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded border border-cloud dark:border-nebula-purple/30 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-deep-cosmos transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-medium">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded border border-cloud dark:border-nebula-purple/30 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-deep-cosmos transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {previewRows.length < totalImportRows && (
        <p className="text-xs text-silver-mist text-center">
          Preview shows {previewRows.length} rows. All {totalImportRows.toLocaleString()} valid rows
          will be imported when you click &quot;Execute Import&quot;.
        </p>
      )}
    </div>
  );
}
