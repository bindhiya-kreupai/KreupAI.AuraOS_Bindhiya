import React, { useCallback, useRef, useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    File,
    FileText,
    Image as ImageIcon,
    Loader2,
    Table as TableIcon,
    Upload,
    X,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface UploadedAttachment {
    /** Server-assigned identifier (e.g. DocumentUpload.id). */
    id: string;
    /** Original file name as uploaded. */
    fileName: string;
    /** MIME type as detected by the browser. */
    contentType: string | null;
    /** File size in bytes. */
    sizeBytes: number;
    /** Caller-assigned URL or storage key for retrieval. */
    storageKey?: string;
    /** Optional metadata returned by the upload handler. */
    metadata?: Record<string, unknown>;
}

export interface AttachmentUploaderProps {
    /**
     * Caller-supplied upload handler. Receives a single File, returns the persisted
     * attachment metadata. The component handles queue, progress, retries.
     */
    onUpload: (file: File) => Promise<UploadedAttachment>;
    /** Called whenever the list of successfully uploaded items changes. */
    onChange?: (items: UploadedAttachment[]) => void;
    /** Optional caller-supplied initial list (for edit-mode use). */
    initial?: UploadedAttachment[];
    /** Max bytes per file (default 10 MB). */
    maxFileSize?: number;
    /** Accept attribute for the file picker + extension validation. */
    acceptedExtensions?: string[];
    /** Cap the number of files (default unlimited). */
    maxFiles?: number;
    /** Render in compact mode (no drop-zone illustration). */
    compact?: boolean;
    className?: string;
}

type QueueItem = {
    file: File;
    status: 'pending' | 'uploading' | 'done' | 'error';
    error?: string;
    attachment?: UploadedAttachment;
};

const DEFAULT_EXT = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.jpg', '.jpeg', '.png', '.heic'];

function fileIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'svg'].includes(ext)) return ImageIcon;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return TableIcon;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return FileText;
    return File;
}

function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Reusable drag-and-drop multi-file attachment uploader. Owns the queue,
 * progress, and validation; defers actual transport to a caller-supplied
 * `onUpload(file)` so each module can persist to its preferred backend
 * (existing `/api/v1/documents/upload`, Supabase Storage signed URL, S3, etc.).
 *
 * Replaces the Document-Vault-specific `DocumentUploader` for non-vault use
 * (HSE incident photos, contract attachments, policy ack evidence, etc.).
 */
export function AttachmentUploader({
    onUpload,
    onChange,
    initial = [],
    maxFileSize = 10 * 1024 * 1024,
    acceptedExtensions = DEFAULT_EXT,
    maxFiles,
    compact = false,
    className,
}: AttachmentUploaderProps) {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [attached, setAttached] = useState<UploadedAttachment[]>(initial);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const accept = acceptedExtensions.join(',');

    const emitChange = useCallback(
        (next: UploadedAttachment[]) => {
            setAttached(next);
            onChange?.(next);
        },
        [onChange],
    );

    const validate = useCallback(
        (file: File): string | null => {
            if (file.size > maxFileSize) return `${file.name}: exceeds ${formatBytes(maxFileSize)}`;
            const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
            if (!acceptedExtensions.includes(ext)) return `${file.name}: unsupported format`;
            if (maxFiles && attached.length + 1 > maxFiles) return `Maximum ${maxFiles} file${maxFiles === 1 ? '' : 's'}`;
            return null;
        },
        [acceptedExtensions, attached.length, maxFileSize, maxFiles],
    );

    async function uploadOne(item: QueueItem, idx: number) {
        setQueue((q) => q.map((it, i) => (i === idx ? { ...it, status: 'uploading' } : it)));
        try {
            const result = await onUpload(item.file);
            setQueue((q) => q.map((it, i) => (i === idx ? { ...it, status: 'done', attachment: result } : it)));
            emitChange([...attached, result]);
        } catch (err) {
            setQueue((q) =>
                q.map((it, i) =>
                    i === idx ? { ...it, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' } : it,
                ),
            );
        }
    }

    function enqueue(files: File[]) {
        const accepted: QueueItem[] = [];
        const rejected: QueueItem[] = [];
        for (const f of files) {
            const error = validate(f);
            if (error) rejected.push({ file: f, status: 'error', error });
            else accepted.push({ file: f, status: 'pending' });
        }
        const next = [...queue, ...rejected, ...accepted];
        setQueue(next);

        // Kick off uploads for accepted items
        accepted.forEach((item) => {
            const idx = next.indexOf(item);
            void uploadOne(item, idx);
        });
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length) enqueue(files);
    }

    function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length) enqueue(files);
        e.target.value = '';
    }

    function removeAttachment(id: string) {
        emitChange(attached.filter((a) => a.id !== id));
    }

    function removeQueueItem(idx: number) {
        setQueue((q) => q.filter((_, i) => i !== idx));
    }

    return (
        <div className={cn('space-y-3', className)}>
            <label
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                    'block cursor-pointer rounded-xl border-2 border-dashed transition-colors',
                    compact ? 'p-3' : 'p-6',
                    dragOver
                        ? 'border-celestial-indigo bg-celestial-indigo/5'
                        : 'border-cloud hover:border-celestial-indigo dark:border-nebula-purple/40 dark:hover:border-celestial-indigo',
                )}
            >
                <div className={cn('flex items-center gap-3', compact ? '' : 'flex-col text-center')}>
                    <Upload className={cn('text-silver-mist', compact ? 'w-5 h-5' : 'w-6 h-6')} />
                    <div className="text-sm text-ink-black dark:text-pearl">
                        <span className="font-medium">{compact ? 'Attach files' : 'Drop files or click to browse'}</span>
                        <div className="text-xs text-silver-mist mt-0.5">
                            {acceptedExtensions.join(', ')} · up to {formatBytes(maxFileSize)} each
                            {maxFiles ? ` · max ${maxFiles} files` : ''}
                        </div>
                    </div>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={accept}
                    className="sr-only"
                    onChange={handlePick}
                />
            </label>

            {/* Currently attached (persisted) */}
            {attached.length > 0 && (
                <ul className="divide-y divide-cloud dark:divide-nebula-purple/20 rounded-lg border border-cloud dark:border-nebula-purple/40 overflow-hidden">
                    {attached.map((a) => {
                        const Icon = fileIcon(a.fileName);
                        return (
                            <li key={a.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                                <Icon className="w-4 h-4 text-celestial-indigo shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="truncate text-ink-black dark:text-pearl">{a.fileName}</div>
                                    <div className="text-xs text-silver-mist">{formatBytes(a.sizeBytes)}</div>
                                </div>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(a.id)}
                                    className="p-1 text-silver-mist hover:text-rose-500 rounded transition-colors"
                                    aria-label={`Remove ${a.fileName}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* In-flight + rejected queue */}
            {queue.length > 0 && (
                <ul className="space-y-1.5">
                    {queue.map((item, i) => {
                        if (item.status === 'done') return null;
                        const Icon = fileIcon(item.file.name);
                        return (
                            <li
                                key={`${item.file.name}-${i}`}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                                    item.status === 'error'
                                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300'
                                        : 'bg-pearl/60 dark:bg-deep-cosmos/40 text-ink-black dark:text-pearl',
                                )}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="truncate">{item.file.name}</div>
                                    <div className="text-xs opacity-80">
                                        {item.status === 'error'
                                            ? item.error
                                            : item.status === 'uploading'
                                                ? 'Uploading…'
                                                : 'Queued'}
                                    </div>
                                </div>
                                {item.status === 'uploading' ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-celestial-indigo shrink-0" />
                                ) : item.status === 'error' ? (
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => removeQueueItem(i)}
                                    className="p-1 hover:opacity-80 rounded transition-opacity"
                                    aria-label={`Dismiss ${item.file.name}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
