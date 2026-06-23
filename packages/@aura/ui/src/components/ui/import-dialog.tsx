import React, { useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import { Sheet } from './sheet';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ImportRowError {
    /** 1-based row number in the source file (data row, not header). */
    row: number;
    /** Optional column the error applies to. */
    column?: string;
    /** Human-readable error message. */
    message: string;
}

export interface ImportPreview {
    /** Total data rows in the source file (excluding header). */
    totalRows: number;
    /** Rows that would import successfully. */
    validRows: number;
    /** Per-row validation errors. */
    errors: ImportRowError[];
    /** Sample of parsed rows for the preview pane (cap to ~10 for perf). */
    sample: Array<Record<string, string>>;
    /** Header columns detected. */
    columns: string[];
}

export interface ImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    /** Title shown in the sheet header (e.g. "Import Employees"). */
    title: string;
    /** Optional one-line description shown above the file picker. */
    description?: string;
    /** Accepted file types (defaults to CSV). */
    accept?: string;
    /**
     * Called with the chosen file. Should parse + validate and return a preview.
     * Run in dry-run mode — DO NOT persist. The "Commit" button triggers `onCommit`.
     */
    onDryRun: (file: File) => Promise<ImportPreview>;
    /**
     * Called when the user clicks "Commit". Receives the same file that was previewed.
     * Should perform the actual import.
     */
    onCommit: (file: File) => Promise<void>;
    /** Optional max preview rows shown in the sample table (default 5). */
    maxSampleRows?: number;
}

/**
 * Two-stage import flow: file pick → dry-run preview (row count, validation errors,
 * sample rows) → explicit commit. The dialog enforces "no silent imports" — users
 * must see the validation report before any data is written.
 */
export function ImportDialog({
    isOpen,
    onClose,
    title,
    description,
    accept = '.csv,text/csv',
    onDryRun,
    onCommit,
    maxSampleRows = 5,
}: ImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<ImportPreview | null>(null);
    const [phase, setPhase] = useState<'pick' | 'previewing' | 'preview' | 'committing'>('pick');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sampleRows = useMemo(() => preview?.sample.slice(0, maxSampleRows) ?? [], [preview, maxSampleRows]);
    const hasBlockingErrors = (preview?.errors?.length ?? 0) > 0 && (preview?.validRows ?? 0) === 0;

    function reset() {
        setFile(null);
        setPreview(null);
        setErrorMessage(null);
        setPhase('pick');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleClose() {
        reset();
        onClose();
    }

    async function handleFile(chosen: File) {
        setFile(chosen);
        setPhase('previewing');
        setErrorMessage(null);
        try {
            const result = await onDryRun(chosen);
            setPreview(result);
            setPhase('preview');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to read file.');
            setPhase('pick');
        }
    }

    async function handleCommit() {
        if (!file) return;
        setPhase('committing');
        setErrorMessage(null);
        try {
            await onCommit(file);
            handleClose();
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Import failed.');
            setPhase('preview');
        }
    }

    return (
        <Sheet isOpen={isOpen} onClose={handleClose} title={title} size="xl"
            footer={
                <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-silver-mist">
                        {preview && (
                            <span>
                                {preview.validRows.toLocaleString()} of {preview.totalRows.toLocaleString()} rows ready
                                {preview.errors.length > 0 && ` · ${preview.errors.length} error${preview.errors.length === 1 ? '' : 's'}`}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={phase === 'committing'}
                            className="px-3 py-1.5 text-sm rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCommit}
                            disabled={phase !== 'preview' || hasBlockingErrors || !preview}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                                'bg-celestial-indigo text-white hover:bg-celestial-indigo/90',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                            )}
                        >
                            {phase === 'committing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>{phase === 'committing' ? 'Importing…' : 'Commit import'}</span>
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {description && (
                    <p className="text-sm text-silver-mist">{description}</p>
                )}

                {/* File picker */}
                <div>
                    <label className="block">
                        <div
                            className={cn(
                                'flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                                phase === 'previewing' || phase === 'committing'
                                    ? 'opacity-60 cursor-wait'
                                    : 'border-cloud hover:border-celestial-indigo dark:border-nebula-purple/40 dark:hover:border-celestial-indigo',
                            )}
                        >
                            <Upload className="w-6 h-6 text-silver-mist" />
                            <div className="text-sm text-ink-black dark:text-pearl text-center">
                                {file ? (
                                    <span className="inline-flex items-center gap-2">
                                        <FileSpreadsheet className="w-4 h-4 text-celestial-indigo" />
                                        <strong>{file.name}</strong>
                                        <span className="text-xs text-silver-mist">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </span>
                                ) : (
                                    <span>
                                        Click to choose a file
                                        <span className="block text-xs text-silver-mist mt-0.5">{accept}</span>
                                    </span>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={accept}
                                disabled={phase === 'previewing' || phase === 'committing'}
                                className="sr-only"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) void handleFile(f);
                                }}
                            />
                        </div>
                    </label>
                    {file && phase === 'preview' && (
                        <button
                            type="button"
                            onClick={reset}
                            className="mt-2 inline-flex items-center gap-1 text-xs text-silver-mist hover:text-ink-black dark:hover:text-pearl"
                        >
                            <X className="w-3 h-3" />
                            Choose a different file
                        </button>
                    )}
                </div>

                {phase === 'previewing' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Validating file…</span>
                    </div>
                )}

                {errorMessage && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Summary */}
                {preview && phase === 'preview' && (
                    <div className="grid grid-cols-3 gap-3">
                        <SummaryStat label="Total rows" value={preview.totalRows.toLocaleString()} tone="neutral" />
                        <SummaryStat label="Valid" value={preview.validRows.toLocaleString()} tone="success" />
                        <SummaryStat label="Errors" value={preview.errors.length.toLocaleString()} tone={preview.errors.length ? 'danger' : 'neutral'} />
                    </div>
                )}

                {/* Sample table */}
                {preview && phase === 'preview' && sampleRows.length > 0 && (
                    <div className="border border-cloud dark:border-nebula-purple/40 rounded-lg overflow-hidden">
                        <div className="px-3 py-2 text-xs font-semibold text-silver-mist bg-pearl/50 dark:bg-deep-cosmos/50 border-b border-cloud dark:border-nebula-purple/40">
                            Preview · first {sampleRows.length} of {preview.totalRows}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="text-silver-mist">
                                    <tr>
                                        {preview.columns.map((c) => (
                                            <th key={c} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{c}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                                    {sampleRows.map((row, i) => (
                                        <tr key={i}>
                                            {preview.columns.map((c) => (
                                                <td key={c} className="px-3 py-1.5 text-ink-black dark:text-pearl whitespace-nowrap">
                                                    {row[c] ?? ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Error list */}
                {preview && preview.errors.length > 0 && (
                    <div className="border border-rose-200 dark:border-rose-500/30 rounded-lg overflow-hidden">
                        <div className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border-b border-rose-200 dark:border-rose-500/30">
                            Validation errors
                        </div>
                        <ul className="divide-y divide-rose-100 dark:divide-rose-500/20 max-h-60 overflow-y-auto">
                            {preview.errors.map((e, i) => (
                                <li key={i} className="px-3 py-2 text-xs text-ink-black dark:text-pearl flex gap-3">
                                    <span className="text-silver-mist font-mono shrink-0">row {e.row}{e.column ? `.${e.column}` : ''}</span>
                                    <span>{e.message}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Sheet>
    );
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone: 'success' | 'danger' | 'neutral' }) {
    const toneCls =
        tone === 'success'
            ? 'text-emerald-700 dark:text-emerald-300'
            : tone === 'danger'
                ? 'text-rose-700 dark:text-rose-300'
                : 'text-ink-black dark:text-pearl';
    return (
        <div className="p-3 rounded-lg bg-pearl/50 dark:bg-deep-cosmos/50 border border-cloud dark:border-nebula-purple/40">
            <div className="text-[10px] uppercase text-silver-mist tracking-wide">{label}</div>
            <div className={cn('mt-1 text-lg font-semibold', toneCls)}>{value}</div>
        </div>
    );
}
