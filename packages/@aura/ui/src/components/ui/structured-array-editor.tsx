'use client';

import React from 'react';
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
 *
 * Used by the rule-simulation, three-way-reconciliation, and
 * fake-risk-clustering evaluator pages — three places that previously
 * asked the user to hand-craft a JSON array in a text field. The
 * editor produces the same typed array; the caller passes it
 * straight to the API.
 *
 * Each row is a `Record<string, unknown>`. The caller defines the
 * column schema; the component handles state, validation hints, and
 * the per-cell input controls. The full array is exposed via
 * `onChange(rows)` so the parent can stage it for submission.
 */

export type StructuredFieldType = 'text' | 'number' | 'boolean' | 'select';

export interface StructuredColumn {
    key: string;
    label: string;
    labelAr?: string;
    type: StructuredFieldType;
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
    placeholder?: string;
    /** Width hint (CSS class, e.g. 'w-24'). */
    widthClass?: string;
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
    } = props;

    const headerLabel = locale === 'ar' && labelAr ? labelAr : label;
    const headerHelp = locale === 'ar' && helpTextAr ? helpTextAr : helpText;
    const headerAdd =
        locale === 'ar' && addLabelAr
            ? addLabelAr
            : (addLabel ?? (locale === 'ar' ? 'إضافة صف' : 'Add row'));

    function update(idx: number, key: string, raw: unknown) {
        const next = value.map((row, i) =>
            i === idx ? { ...row, [key]: raw } : row,
        ) as T[];
        onChange(next);
    }

    function removeRow(idx: number) {
        if (value.length <= minRows) return;
        const next = value.filter((_, i) => i !== idx) as T[];
        onChange(next);
    }

    function addRow() {
        if (value.length >= maxRows) return;
        const next = [...value, emptyRowFor(columns) as T];
        onChange(next);
    }

    return (
        <div className={cn('space-y-2', className)} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {headerLabel && (
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-800">{headerLabel}</label>
                    <button
                        type="button"
                        onClick={addRow}
                        disabled={value.length >= maxRows}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-600 text-white px-3 py-1 text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Plus className="w-3 h-3" />
                        {headerAdd}
                    </button>
                </div>
            )}
            {headerHelp && <p className="text-xs text-gray-500">{headerHelp}</p>}
            <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={cn(
                                        'px-2 py-1.5 text-left text-xs font-semibold text-gray-700 whitespace-nowrap',
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
                            <th scope="col" className="w-10 px-2 py-1.5">
                                <span className="sr-only">
                                    {locale === 'ar' ? 'حذف' : 'Remove'}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {value.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-2 py-4 text-center text-xs text-gray-500"
                                >
                                    {locale === 'ar'
                                        ? 'لا توجد صفوف. اضغط "إضافة صف" للبدء.'
                                        : 'No rows. Click "Add row" to start.'}
                                </td>
                            </tr>
                        )}
                        {value.map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-t border-gray-100">
                                {columns.map((col) => {
                                    const cellValue = (row as Record<string, unknown>)[col.key];
                                    const cellId = `editor-${rowIdx}-${col.key}`;
                                    if (col.type === 'select' && col.options) {
                                        return (
                                            <td key={col.key} className="px-2 py-1">
                                                <select
                                                    id={cellId}
                                                    aria-label={`${col.label} row ${rowIdx + 1}`}
                                                    value={(cellValue as string) ?? ''}
                                                    onChange={(e) =>
                                                        update(rowIdx, col.key, e.target.value)
                                                    }
                                                    className={cn(
                                                        'w-full border border-gray-300 rounded px-1.5 py-1 text-sm',
                                                        col.widthClass,
                                                    )}
                                                >
                                                    <option value="">
                                                        {locale === 'ar' ? 'اختر…' : '—'}
                                                    </option>
                                                    {col.options.map((o) => (
                                                        <option key={o.value} value={o.value}>
                                                            {o.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        );
                                    }
                                    if (col.type === 'boolean') {
                                        return (
                                            <td key={col.key} className="px-2 py-1">
                                                <input
                                                    id={cellId}
                                                    type="checkbox"
                                                    aria-label={`${col.label} row ${rowIdx + 1}`}
                                                    checked={!!cellValue}
                                                    onChange={(e) =>
                                                        update(rowIdx, col.key, e.target.checked)
                                                    }
                                                    className="rounded border-gray-300"
                                                />
                                            </td>
                                        );
                                    }
                                    if (col.type === 'number') {
                                        return (
                                            <td key={col.key} className="px-2 py-1">
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
                                                    className={cn(
                                                        'w-full border border-gray-300 rounded px-1.5 py-1 text-sm tabular-nums',
                                                        col.widthClass,
                                                    )}
                                                />
                                            </td>
                                        );
                                    }
                                    return (
                                        <td key={col.key} className="px-2 py-1">
                                            <input
                                                id={cellId}
                                                type="text"
                                                aria-label={`${col.label} row ${rowIdx + 1}`}
                                                value={(cellValue as string) ?? ''}
                                                placeholder={col.placeholder}
                                                onChange={(e) =>
                                                    update(rowIdx, col.key, e.target.value)
                                                }
                                                className={cn(
                                                    'w-full border border-gray-300 rounded px-1.5 py-1 text-sm',
                                                    col.widthClass,
                                                )}
                                            />
                                        </td>
                                    );
                                })}
                                <td className="px-2 py-1 text-right">
                                    <button
                                        type="button"
                                        onClick={() => removeRow(rowIdx)}
                                        disabled={value.length <= minRows}
                                        aria-label={
                                            locale === 'ar'
                                                ? `حذف الصف ${rowIdx + 1}`
                                                : `Remove row ${rowIdx + 1}`
                                        }
                                        className="inline-flex items-center text-rose-600 hover:text-rose-800 disabled:text-gray-300"
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
