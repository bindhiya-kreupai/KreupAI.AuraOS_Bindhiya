'use client';

/**
 * @module FileUploadStep
 * @description Step 1 of BulkImportWizard — drag-drop or click to upload
 *   CSV / XLSX files with file-type and size validation.
 */

import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ParsedFile } from '@/services/bulkImportService';
import type { ImportEntityType } from '@/services/bulkImportService';

const MAX_FILE_SIZE_MB = 10;
const MAX_ROWS = 10_000;
const _ACCEPTED_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

const ENTITY_LABELS: Record<ImportEntityType, string> = {
  employees: 'Employees',
  departments: 'Departments',
  positions: 'Positions',
  'leave-balances': 'Leave Balances',
  attendance: 'Attendance Records',
};

interface FileUploadStepProps {
  onFileParsed: (parsed: ParsedFile, entityType: ImportEntityType) => void;
}

export default function FileUploadStep({ onFileParsed }: FileUploadStepProps) {
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [entityType, setEntityType] = useState<ImportEntityType>('employees');
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setParsed(null);

      // File type check
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(`.${ext}`)) {
        setError(`Unsupported file type: .${ext}. Please upload a CSV or Excel file.`);
        return;
      }

      // Size check
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_FILE_SIZE_MB) {
        setError(`File too large (${sizeMB.toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }

      setParsing(true);
      try {
        // Dynamic import to keep initial bundle small
        const { parseFile } = await import('@/services/bulkImportService');
        const result = await parseFile(file);

        if (result.totalRows > MAX_ROWS) {
          setError(
            `File contains ${result.totalRows.toLocaleString()} rows. Maximum is ${MAX_ROWS.toLocaleString()} rows per import.`
          );
          setParsing(false);
          return;
        }

        setParsed(result);
        onFileParsed(result, entityType);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'Failed to parse file.');
      } finally {
        setParsing(false);
      }
    },
    [entityType, onFileParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    setParsed(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Upload File</h3>
        <p className="text-sm text-silver-mist mt-0.5">
          Upload a CSV or Excel file to import data into AuraOS.
        </p>
      </div>

      {/* Entity Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-ink-black dark:text-pearl mb-1.5">
          Import Type
        </label>
        <select
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value as ImportEntityType);
            setParsed(null);
            setError(null);
          }}
          className="w-full sm:w-64 px-3 py-2 bg-white dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/40"
        >
          {(Object.keys(ENTITY_LABELS) as ImportEntityType[]).map((type) => (
            <option key={type} value={type}>
              {ENTITY_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      {!parsed ? (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-celestial-indigo bg-celestial-indigo/5'
              : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/50 hover:bg-celestial-indigo/3'
          }`}
        >
          {parsing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-celestial-indigo border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-silver-mist">Parsing file…</p>
            </div>
          ) : (
            <>
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${
                  dragging ? 'text-celestial-indigo' : 'text-silver-mist'
                }`}
              />
              <p className="text-ink-black dark:text-pearl font-medium">
                {dragging ? 'Drop to upload' : 'Drag and drop your file here'}
              </p>
              <p className="text-silver-mist text-sm mt-1">or click to browse files</p>
              <span className="mt-4 inline-block px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
                Choose File
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      ) : (
        /* Parsed file preview card */
        <div className="flex items-center justify-between gap-4 p-4 bg-aurora-green/10 border border-aurora-green/30 rounded-xl">
          <div className="flex items-center gap-3">
            {parsed.fileName.endsWith('.csv') ? (
              <FileText className="w-8 h-8 text-aurora-green shrink-0" />
            ) : (
              <FileSpreadsheet className="w-8 h-8 text-aurora-green shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-ink-black dark:text-pearl">
                {parsed.fileName}
              </p>
              <p className="text-xs text-silver-mist mt-0.5">
                {parsed.totalRows.toLocaleString()} rows &bull; {parsed.columns.length} columns
                &bull; {formatBytes(parsed.fileSize)}
              </p>
              {parsed.sheetNames && (
                <p className="text-xs text-silver-mist">
                  Sheet: <span className="font-medium">{parsed.activeSheet}</span>
                  {parsed.sheetNames.length > 1 && ` (+${parsed.sheetNames.length - 1} more)`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-aurora-green" />
            <button
              onClick={handleRemove}
              className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/20 text-silver-mist hover:text-rose-500 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
        </div>
      )}

      {/* Format hints */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-silver-mist">
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Supported: CSV, XLSX, XLS
        </span>
        <span>Max size: {MAX_FILE_SIZE_MB} MB</span>
        <span>Max rows: {MAX_ROWS.toLocaleString()}</span>
        <span>First row must be column headers</span>
      </div>
    </div>
  );
}
