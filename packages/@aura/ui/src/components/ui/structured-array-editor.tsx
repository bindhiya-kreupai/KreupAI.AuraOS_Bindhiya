'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Structured array editor — replaces "paste a JSON array" textareas.
 *
 * Renders an array of typed records as a small editable table:
 *   - one row per record
 *   - one column per field (typed: text / number / select / boolean)
 *   - Add row / Remove row buttons
 *   - bilingual column headers
 */

export type StructuredFieldType = 'text' | 'number' | 'boolean' | 'select' | 'date' | 'searchable-select';

export interface StructuredColumn {
    key: string;
    label: string;
    labelAr?: string;
    type: StructuredFieldType;
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
    placeholder?: string;
    widthClass?: string;
    apiUrl?: string;
    readOnly?: boolean;
}

export interface StructuredArrayEditorProps<T extends Record<string, unknown> = Record<string, unknown>> {
    columns: StructuredColumn[];
    value: T[];
    onChange: (next: T[]) => void;
    /** Optional label rendered above the table. */
    label?: string;
    labelAr?: string;
    /** Optional caption / help text. */
    helpText?: string;
    helpTextAr?: string;
    /** Minimum number of rows (Add button stays disabled when length <= min). */
    minRows?: number;
    /** Maximum number of rows (Add button disabled when length >= max). */
    maxRows?: number;
    /** Locale toggle. */
    locale?: 'en' | 'ar';
    className?: string;
    /** Customise the Add Row button label. */
    addLabel?: string;
    addLabelAr?: string;
    disabled?: boolean;
}

function emptyRowFor(columns: StructuredColumn[]): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    for (const c of columns) {
        row[c.key] =
            c.type === 'number' ? 0 : c.type === 'boolean' ? false : '';
    }
    return row;
}

export function StructuredArrayEditor<T extends Record<string, unknown> = Record<string, unknown>>(
    props: StructuredArrayEditorProps<T>,
) {
    const {
        columns,
        value,
        onChange,
        label,
        labelAr,
        helpText,
        helpTextAr,
        minRows = 0,
        maxRows = 100,
        locale = 'en',
        className,
        addLabel,
        addLabelAr,
        disabled = false,
    } = props;

    const headerLabel = locale === 'ar' && labelAr ? labelAr : label;
    const headerHelp = locale === 'ar' && helpTextAr ? helpTextAr : helpText;
    const headerAdd =
        locale === 'ar' && addLabelAr
            ? addLabelAr
            : (addLabel ?? (locale === 'ar' ? 'إضافة صف' : 'Add row'));

    function update(idx: number, key: string, raw: unknown) {
        if (disabled) return;
        const next = value.map((row, i) =>
            i === idx ? { ...row, [key]: raw } : row,
        ) as T[];
        onChange(next);
    }

    function removeRow(idx: number) {
        if (disabled || value.length <= minRows) return;
        const next = value.filter((_, i) => i !== idx) as T[];
        onChange(next);
    }

    function addRow() {
        if (disabled || value.length >= maxRows) return;
        const next = [...value, emptyRowFor(columns) as T];
        onChange(next);
    }

    return (
        <div className={cn('space-y-2', className)} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {headerLabel && (
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{headerLabel}</label>
                    <button
                        type="button"
                        onClick={addRow}
                        disabled={disabled || value.length >= maxRows}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-3 py-1.5 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {headerAdd}
                    </button>
                </div>
            )}
            {headerHelp && <p className="text-xs text-slate-455 dark:text-slate-500">{headerHelp}</p>}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50/75 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={cn(
                                        'px-3 py-2.5 text-left text-xs font-semibold text-slate-655 dark:text-slate-400 whitespace-nowrap',
                                        col.widthClass,
                                    )}
                                >
                                    {locale === 'ar' && col.labelAr ? col.labelAr : col.label}
                                    {col.required && (
                                        <span className="text-rose-600 ml-0.5" aria-hidden>
                                            *
                                        </span>
                                    )}
                                </th>
                            ))}
                            <th scope="col" className="w-10 px-3 py-2.5">
                                <span className="sr-only">
                                    {locale === 'ar' ? 'حذف' : 'Remove'}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {value.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-3 py-6 text-center text-xs text-slate-400 dark:text-slate-500"
                                >
                                    {locale === 'ar'
                                        ? 'لا توجد صفوف. اضغط "إضافة صف" للبدء.'
                                        : 'No rows. Click "Add row" to start.'}
                                </td>
                            </tr>
                        )}
                        {value.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition-colors">
                                {columns.map((col) => {
                                    const cellValue = (row as Record<string, unknown>)[col.key];
                                    const cellId = `editor-${rowIdx}-${col.key}`;
                                    if (col.type === 'select' && col.options) {
                                        return (
                                            <td key={col.key} className="px-2.5 py-2">
                                                <select
                                                    id={cellId}
                                                    aria-label={`${col.label} row ${rowIdx + 1}`}
                                                    value={(cellValue as string) ?? ''}
                                                    onChange={(e) =>
                                                        update(rowIdx, col.key, e.target.value)
                                                    }
                                                    disabled={disabled}
                                                    className={cn(
                                                        'w-full border border-slate-200 dark:border-slate-750 rounded-xl px-2.5 py-1.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed',
                                                        col.widthClass,
                                                    )}
                                                >
                                                    <option value="" className="dark:bg-slate-950">
                                                        {locale === 'ar' ? 'اختر…' : '—'}
                                                    </option>
                                                    {col.options.map((o) => (
                                                        <option key={o.value} value={o.value} className="dark:bg-slate-950">
                                                            {o.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        );
                                    }
                                    if (col.type === 'boolean') {
                                        return (
                                            <td key={col.key} className="px-2.5 py-2">
                                                <div className="flex items-center justify-start h-8">
                                                    <input
                                                        id={cellId}
                                                        type="checkbox"
                                                        aria-label={`${col.label} row ${rowIdx + 1}`}
                                                        checked={!!cellValue}
                                                        onChange={(e) =>
                                                            update(rowIdx, col.key, e.target.checked)
                                                        }
                                                        disabled={disabled}
                                                        className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-0 w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </td>
                                        );
                                    }
                                    if (col.type === 'number') {
                                        return (
                                            <td key={col.key} className="px-2.5 py-2">
                                                <input
                                                    id={cellId}
                                                    type="number"
                                                    aria-label={`${col.label} row ${rowIdx + 1}`}
                                                    value={Number.isFinite(cellValue as number) ? String(cellValue) : ''}
                                                    placeholder={col.placeholder}
                                                    onChange={(e) =>
                                                        update(
                                                            rowIdx,
                                                            col.key,
                                                            e.target.value === ''
                                                                ? 0
                                                                : Number(e.target.value),
                                                        )
                                                    }
                                                    disabled={disabled}
                                                    className={cn(
                                                        'w-full border border-slate-200 dark:border-slate-750 rounded-xl px-2.5 py-1.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 tabular-nums disabled:opacity-50 disabled:cursor-not-allowed',
                                                        col.widthClass,
                                                    )}
                                                />
                                            </td>
                                        );
                                    }
                                    
                                    if (col.type === 'date') {
                                        return (
                                            <td key={col.key} className="px-2.5 py-2">
                                                <input
                                                    id={cellId}
                                                    type="date"
                                                    aria-label={`${col.label} row ${rowIdx + 1}`}
                                                    value={(cellValue as string) ?? ''}
                                                    onChange={(e) =>
                                                        update(rowIdx, col.key, e.target.value)
                                                    }
                                                    disabled={disabled}
                                                    className={cn(
                                                        'w-full border border-slate-200 dark:border-slate-750 rounded-xl px-2.5 py-1.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed',
                                                        col.widthClass,
                                                    )}
                                                />
                                            </td>
                                        );
                                    }
                                   if (col.type === 'searchable-select') {
                                        return (
                                            <td key={col.key} className="px-2 py-1">
                                                <SearchableSelect
                                                    apiUrl={col.apiUrl ?? ''}
                                                    value={(cellValue as string) ?? ''}
                                                    onSelect={(id, label, extra) => {
                                                        update(rowIdx, col.key, id);
                                                        // If there's a linked role column, auto-fill it.
                                                        const roleCol = columns.find((c) => c.key === 'role');
                                                        if (roleCol && extra?.role) {
                                                            update(rowIdx, 'role', extra.role);
                                                        }
                                                    }}
                                                    placeholder={col.placeholder ?? 'Search...'}
                                                />
                                            </td>
                                        );
                                    }
                                    if (col.readOnly) {
                                        return (
                                            <td key={col.key} className="px-2 py-1">
                                                <input
                                                    type="text"
                                                    value={(cellValue as string) ?? ''}
                                                    readOnly
                                                    className={cn(
                                                        'w-full border border-gray-200 bg-gray-50 rounded px-1.5 py-1 text-sm text-gray-600',
                                                        col.widthClass,
                                                    )}
                                                />
                                            </td>
                                        );
                                    }
                                    return (
                                        <td key={col.key} className="px-2.5 py-2">
                                            <input
                                                id={cellId}
                                                type="text"
                                                aria-label={`${col.label} row ${rowIdx + 1}`}
                                                value={(cellValue as string) ?? ''}
                                                placeholder={col.placeholder}
                                                onChange={(e) =>
                                                    update(rowIdx, col.key, e.target.value)
                                                }
                                                disabled={disabled}
                                                className={cn(
                                                    'w-full border border-slate-200 dark:border-slate-750 rounded-xl px-2.5 py-1.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed',
                                                    col.widthClass,
                                                )}
                                            />
                                        </td>
                                    );
                                })}
                                <td className="px-2.5 py-2 text-right">
                                    <button
                                        type="button"
                                        onClick={() => removeRow(rowIdx)}
                                        disabled={disabled || value.length <= minRows}
                                        aria-label={
                                            locale === 'ar'
                                                ? `حذف الصف ${rowIdx + 1}`
                                                : `Remove row ${rowIdx + 1}`
                                        }
                                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export function SearchableSelect({
    apiUrl,
    value,
    onSelect,
    placeholder,
}: {
    apiUrl: string;
    value: string;
    onSelect: (id: string, label: string, extra?: Record<string, unknown>) => void;
    placeholder: string;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Array<{ id: string; label: string; role?: string }>>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}?search=${encodeURIComponent(query)}&limit=10`);
                const json = await res.json();
                const items = Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json?.data?.items)
      ? json.data.items
      : [];
setResults(
    items.map((it: any) => ({
        id: it.id,
        label:
            it.name ??
            it.label ??
            it.documentCode ??
            `${it.firstName ?? ''} ${it.lastName ?? ''}`.trim() ??
            it.email ??
            it.id,
        role: it.role ?? undefined,
    })),
);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, apiUrl]);

    return (
        <div className="relative" ref={boxRef}>
            <input
                type="text"
                value={open ? query : value}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded px-1.5 py-1 text-sm"
            />
            {open && (query.length >= 2) && (
                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                    {loading && <div className="px-2 py-1 text-xs text-gray-500">Searching…</div>}
                    {!loading && results.length === 0 && (
                        <div className="px-2 py-1 text-xs text-gray-500">No results</div>
                    )}
                    {results.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                                onSelect(r.id, r.label, { role: r.role });
                                setQuery(r.label);
                                setOpen(false);
                            }}
                            className="block w-full text-left px-2 py-1 text-sm hover:bg-blue-50"
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
                                 
