import React, { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileType2, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ExportMenuProps {
    /** Called when a format is chosen. Should resolve to a Blob (or void if it handles download itself). */
    onExport: (format: ExportFormat) => Promise<Blob | void> | Blob | void;
    /** Base filename without extension. Used when the handler returns a Blob. */
    filename?: string;
    /** Formats to expose. Defaults to all three. */
    formats?: ExportFormat[];
    /** Optional row count badge shown next to the trigger (e.g. "Export 1,234"). */
    rowCount?: number;
    /** Disable the trigger entirely. */
    disabled?: boolean;
    className?: string;
}

const FORMAT_META: Record<ExportFormat, { label: string; ext: string; mime: string; icon: any }> = {
    csv: { label: 'CSV', ext: 'csv', mime: 'text/csv;charset=utf-8', icon: FileText },
    xlsx: { label: 'Excel (.xlsx)', ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', icon: FileSpreadsheet },
    pdf: { label: 'PDF', ext: 'pdf', mime: 'application/pdf', icon: FileType2 },
};

function triggerDownload(blob: Blob, filename: string, ext: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Format-chooser dropdown that wraps a single export handler. Pass a handler that
 * fetches/computes the file for a given format; ExportMenu handles the download.
 *
 * Replaces the icon-only `onExport` callback that DataTable / DataPage expose so
 * every list page can offer CSV/XLSX/PDF without per-module wiring.
 */
export function ExportMenu({
    onExport,
    filename = 'export',
    formats = ['csv', 'xlsx', 'pdf'],
    rowCount,
    disabled,
    className,
}: ExportMenuProps) {
    const [open, setOpen] = useState(false);
    const [busyFormat, setBusyFormat] = useState<ExportFormat | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function onDocClick(e: MouseEvent) {
            if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
        }
        function onEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onEsc);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onEsc);
        };
    }, [open]);

    async function handlePick(format: ExportFormat) {
        if (busyFormat) return;
        setBusyFormat(format);
        try {
            const result = await onExport(format);
            if (result instanceof Blob) {
                triggerDownload(result, filename, FORMAT_META[format].ext);
            }
        } finally {
            setBusyFormat(null);
            setOpen(false);
        }
    }

    return (
        <div ref={wrapperRef} className={cn('relative inline-block', className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    'text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
                aria-haspopup="menu"
                aria-expanded={open}
                title="Export"
            >
                <Download className="w-4 h-4" />
                <span>Export</span>
                {typeof rowCount === 'number' && rowCount > 0 && (
                    <span className="text-[10px] text-silver-mist">({rowCount.toLocaleString()})</span>
                )}
            </button>

            {open && (
                <div
                    role="menu"
                    className={cn(
                        'absolute right-0 mt-1 z-50 min-w-[180px]',
                        'bg-white dark:bg-stellar-blue rounded-lg shadow-lg ring-1 ring-cloud dark:ring-nebula-purple/40',
                        'overflow-hidden',
                    )}
                >
                    {formats.map((f) => {
                        const meta = FORMAT_META[f];
                        const Icon = meta.icon;
                        const isBusy = busyFormat === f;
                        return (
                            <button
                                key={f}
                                role="menuitem"
                                disabled={busyFormat !== null}
                                onClick={() => handlePick(f)}
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                                    'text-ink-black dark:text-pearl',
                                    'hover:bg-pearl dark:hover:bg-deep-cosmos',
                                    'disabled:opacity-60 disabled:cursor-wait',
                                )}
                            >
                                {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4 text-silver-mist" />}
                                <span>{meta.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
