'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Search, Edit2, X, Check, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Structured array editor — Enterprise Data Table Component.
 *
 * Supports Dual Mode:
 *   - Read-only Enterprise Data Table (default for imported compliance records)
 *   - Editable Mode (toggled on demand via "Unlock Editing")
 *   - Clean Modal dialog for adding & editing individual records
 *   - Dynamic Pagination (10, 20, 50, 100, All)
 *   - Instant dataset search & filtering
 *   - Bilingual headers & jurisdiction flag chips
 *   - Async searchable-select fields backed by a remote API
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
    /** Default page size for pagination (default 10). */
    defaultPageSize?: number;
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
        maxRows = 500,
        locale = 'en',
        className,
        addLabel,
        addLabelAr,
        disabled = false,
        defaultPageSize = 10,
    } = props;

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(defaultPageSize);
    const [filterQuery, setFilterQuery] = useState('');

    // Dual Mode: Default to Read-Only view for imported enterprise records
    const [isEditingDataset, setIsEditingDataset] = useState(false);

    // Modal State for adding/editing records cleanly
    const [showModal, setShowModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [modalData, setModalData] = useState<Record<string, unknown>>({});

    const headerLabel = locale === 'ar' && labelAr ? labelAr : label;
    const headerHelp = locale === 'ar' && helpTextAr ? helpTextAr : helpText;
    const headerAdd =
        locale === 'ar' && addLabelAr
            ? addLabelAr
            : (addLabel ?? (locale === 'ar' ? 'إضافة صف' : 'Add record'));

    // Instant filter matching across all row field values
    const filteredRows = useMemo(() => {
        if (!filterQuery.trim()) return value.map((row, originalIndex) => ({ row, originalIndex }));
        const q = filterQuery.toLowerCase().trim();
        return value
            .map((row, originalIndex) => ({ row, originalIndex }))
            .filter(({ row }) => {
                return Object.values(row).some((val) =>
                    String(val ?? '').toLowerCase().includes(q)
                );
            });
    }, [value, filterQuery]);

    const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredRows.length / pageSize) || 1;

    // Reset current page when filtering or changing total rows
    useEffect(() => {
        setCurrentPage(1);
    }, [filterQuery, pageSize]);

    const paginatedRows = useMemo(() => {
        if (pageSize === -1) return filteredRows;
        const start = (currentPage - 1) * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, currentPage, pageSize]);

    function update(originalIdx: number, key: string, raw: unknown) {
        if (disabled) return;
        const next = value.map((row, i) =>
            i === originalIdx ? { ...row, [key]: raw } : row,
        ) as T[];
        onChange(next);
    }

    function removeRow(originalIdx: number) {
        if (disabled || value.length <= minRows) return;
        const next = value.filter((_, i) => i !== originalIdx) as T[];
        onChange(next);
    }

    // Modal open handlers
    function openAddModal() {
        if (disabled || value.length >= maxRows) return;
        setModalData(emptyRowFor(columns));
        setEditingIndex(null);
        setShowModal(true);
    }

    function openEditModal(originalIdx: number) {
        if (disabled) return;
        setModalData({ ...value[originalIdx] });
        setEditingIndex(originalIdx);
        setShowModal(true);
    }

    function saveModalRecord() {
        if (disabled) return;
        if (editingIndex === null) {
            // Adding new row
            const next = [...value, modalData as T];
            onChange(next);
            if (pageSize !== -1) {
                const nextTotalPages = Math.ceil((value.length + 1) / pageSize);
                setCurrentPage(nextTotalPages);
            }
        } else {
            // Editing existing row
            const next = value.map((row, i) =>
                i === editingIndex ? { ...row, ...modalData } : row
            ) as T[];
            onChange(next);
        }
        setShowModal(false);
        setModalData({});
        setEditingIndex(null);
    }

    return (
        <div className={cn('space-y-2', className)} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {headerLabel && (
                    <div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-slate-800 dark:text-slate-200">{headerLabel}</label>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                {value.length} {locale === 'ar' ? 'سجل' : 'records'}
                            </span>

                            {/* Mode Indicator Badge */}
                            {!isEditingDataset ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                                    <ShieldCheck className="w-3 h-3" />
                                    {locale === 'ar' ? 'بيانات السجل موثقة (عرض فقط)' : 'Authoritative Register Data (Read-only)'}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                                    <Unlock className="w-3 h-3" />
                                    {locale === 'ar' ? 'وضع التعديل المباشر' : 'Bulk Edit Mode Enabled'}
                                </span>
                            )}
                        </div>
                        {headerHelp && <p className="text-xs text-slate-450 dark:text-slate-500 pt-0.5">{headerHelp}</p>}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    {/* Instant Search Bar for Dataset if dataset length > 3 */}
                    {value.length > 3 && (
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                            <input
                                type="text"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                placeholder={locale === 'ar' ? 'تصفية الجدول...' : 'Search dataset...'}
                                className="pl-7 pr-2.5 py-1 text-xs border border-slate-200 dark:border-slate-750 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white w-36 sm:w-44"
                            />
                        </div>
                    )}

                    {/* Unlock / Lock Inline Editing Mode Button */}
                    <button
                        type="button"
                        onClick={() => setIsEditingDataset(!isEditingDataset)}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer shadow-sm",
                            isEditingDataset
                                ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                    >
                        {isEditingDataset ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                        {isEditingDataset
                            ? (locale === 'ar' ? 'قفل الجدول (عرض فقط)' : 'Lock Table (Read-only)')
                            : (locale === 'ar' ? 'تمكين التعديل المباشر' : 'Unlock Editing')}
                    </button>

                    {/* Add Record Modal Button */}
                    <button
                        type="button"
                        onClick={openAddModal}
                        disabled={disabled || value.length >= maxRows}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-3 py-1.5 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {headerAdd}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50/75 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th scope="col" className="w-8 px-3 py-2.5 text-center text-xs font-bold text-slate-400">#</th>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={cn(
                                        'px-3.5 py-2.5 text-left text-xs font-bold text-slate-655 dark:text-slate-400 whitespace-nowrap',
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
                            <th scope="col" className="w-16 px-3.5 py-2.5 text-right">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {paginatedRows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length + 2}
                                    className="px-3.5 py-6 text-center text-xs text-slate-400 dark:text-slate-500"
                                >
                                    {filterQuery.trim()
                                        ? (locale === 'ar' ? 'لا توجد صفوف تطابق البحث.' : 'No rows match filter criteria.')
                                        : (locale === 'ar' ? 'لا توجد صفوف. اضغط "إضافة سجل" للبدء.' : 'No rows in register. Click "Add record" to start.')}
                                </td>
                            </tr>
                        )}
                        {paginatedRows.map(({ row, originalIndex }) => (
                            <tr key={originalIndex} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-3 py-3 text-center text-[11px] font-mono font-medium text-slate-400">
                                    {originalIndex + 1}
                                </td>

                                {columns.map((col) => {
                                    const cellValue = (row as Record<string, unknown>)[col.key];
                                    const cellId = `editor-${originalIndex}-${col.key}`;

                                    // READ-ONLY ENTERPRISE DISPLAY MODE (DEFAULT)
                                    if (!isEditingDataset) {
                                        if (col.key === 'jurisdiction') {
                                            const code = String(cellValue ?? 'SAU').toUpperCase();
                                            return (
                                                <td key={col.key} className="px-3.5 py-3 text-xs">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                                                        {code === 'SAU' ? '🇸🇦 SAU' : code === 'ARE' ? '🇦🇪 ARE' : code === 'BHR' ? '🇧🇭 BHR' : code === 'KWT' ? '🇰🇼 KWT' : code === 'QAT' ? '🇶🇦 QAT' : code === 'EU' ? '🇪🇺 EU' : code}
                                                    </span>
                                                </td>
                                            );
                                        }

                                        if (col.key === 'requestTitle') {
                                            return (
                                                <td key={col.key} className="px-3.5 py-3 text-xs font-bold text-slate-900 dark:text-white max-w-xs truncate">
                                                    {String(cellValue || 'Employee Data Access Request')}
                                                </td>
                                            );
                                        }

                                        if (col.key === 'requestId') {
                                            return (
                                                <td key={col.key} className="px-3.5 py-3 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                                    {String(cellValue || '—')}
                                                </td>
                                            );
                                        }

                                        if (col.type === 'boolean') {
                                            return (
                                                <td key={col.key} className="px-3.5 py-3 text-xs">
                                                    <span className={cn("px-2 py-0.5 rounded font-bold text-[10px]", cellValue ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600")}>
                                                        {cellValue ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={col.key} className="px-3.5 py-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                                                {cellValue !== undefined && cellValue !== null && cellValue !== '' ? String(cellValue) : '—'}
                                            </td>
                                        );
                                    }

                                    // EDITABLE INLINE MODE (WHEN UNLOCKED)
                                    if (col.type === 'select' && col.options) {
                                        return (
                                            <td key={col.key} className="px-2.5 py-2">
                                                <select
                                                    id={cellId}
                                                    aria-label={`${col.label} row ${originalIndex + 1}`}
                                                    value={(cellValue as string) ?? ''}
                                                    onChange={(e) =>
                                                        update(originalIndex, col.key, e.target.value)
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
                                                        aria-label={`${col.label} row ${originalIndex + 1}`}
                                                        checked={!!cellValue}
                                                        onChange={(e) =>
                                                            update(originalIndex, col.key, e.target.checked)
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
                                                    aria-label={`${col.label} row ${originalIndex + 1}`}
                                                    value={Number.isFinite(cellValue as number) ? String(cellValue) : ''}
                                                    placeholder={col.placeholder}
                                                    onChange={(e) =>
                                                        update(
                                                            originalIndex,
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
                                                    aria-label={`${col.label} row ${originalIndex + 1}`}
                                                    value={(cellValue as string) ?? ''}
                                                    onChange={(e) =>
                                                        update(originalIndex, col.key, e.target.value)
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
                                            <td key={col.key} className="px-2.5 py-2">
                                                <SearchableSelect
                                                    apiUrl={col.apiUrl ?? ''}
                                                    value={(cellValue as string) ?? ''}
                                                    onSelect={(id) => {
                                                        update(originalIndex, col.key, id);
                                                    }}
                                                    placeholder={col.placeholder ?? 'Search...'}
                                                />
                                            </td>
                                        );
                                    }
                                    if (col.readOnly) {
                                        return (
                                            <td key={col.key} className="px-2.5 py-2">
                                                <input
                                                    type="text"
                                                    value={(cellValue as string) ?? ''}
                                                    readOnly
                                                    className={cn(
                                                        'w-full border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-750 rounded-xl px-2.5 py-1.5 text-sm text-slate-500 dark:text-slate-400',
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
                                                aria-label={`${col.label} row ${originalIndex + 1}`}
                                                value={(cellValue as string) ?? ''}
                                                placeholder={col.placeholder}
                                                onChange={(e) =>
                                                    update(originalIndex, col.key, e.target.value)
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

                                <td className="px-3.5 py-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(originalIndex)}
                                            disabled={disabled}
                                            aria-label={locale === 'ar' ? `تعديل الصف ${originalIndex + 1}` : `Edit row ${originalIndex + 1}`}
                                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                                            title="Edit in modal"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(originalIndex)}
                                            disabled={disabled || value.length <= minRows}
                                            aria-label={
                                                locale === 'ar'
                                                    ? `حذف الصف ${originalIndex + 1}`
                                                    : `Remove row ${originalIndex + 1}`
                                            }
                                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Dynamic Pagination Bar for Evaluation Dataset */}
            {value.length > 5 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-2 px-1 text-slate-500 font-medium">
                    <div>
                        Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredRows.length > 0 ? (pageSize === -1 ? 1 : (currentPage - 1) * pageSize + 1) : 0}</span> to <span className="font-bold text-slate-800 dark:text-slate-200">{pageSize === -1 ? filteredRows.length : Math.min(currentPage * pageSize, filteredRows.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredRows.length}</span> records
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 text-[11px]">Rows/page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-950 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={-1}>All</option>
                            </select>
                        </div>

                        {pageSize !== -1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className="p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    className="p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Add / Edit Record Form Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-[520px] max-w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                {editingIndex === null ? <Plus className="w-4 h-4 text-emerald-500" /> : <Edit2 className="w-4 h-4 text-amber-500" />}
                                {editingIndex === null
                                    ? (locale === 'ar' ? 'إضافة سجل جديد' : 'Add New Record')
                                    : (locale === 'ar' ? `تعديل السجل #${editingIndex + 1}` : `Edit Record #${editingIndex + 1}`)}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Field Inputs */}
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {columns.map((col) => {
                                const val = modalData[col.key];
                                const fieldLabel = locale === 'ar' && col.labelAr ? col.labelAr : col.label;
                                const fieldId = `modal-field-${col.key}`;

                                return (
                                    <div key={col.key} className="space-y-1.5">
                                        <label htmlFor={fieldId} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {fieldLabel}
                                            {col.required && <span className="text-rose-600 ml-0.5">*</span>}
                                        </label>

                                        {col.type === 'select' && col.options ? (
                                            <select
                                                id={fieldId}
                                                value={(val as string) ?? ''}
                                                onChange={(e) => setModalData({ ...modalData, [col.key]: e.target.value })}
                                                className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white"
                                            >
                                                <option value="">{locale === 'ar' ? 'اختر…' : 'Select option…'}</option>
                                                {col.options.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        ) : col.type === 'boolean' ? (
                                            <select
                                                id={fieldId}
                                                value={val ? 'true' : 'false'}
                                                onChange={(e) => setModalData({ ...modalData, [col.key]: e.target.value === 'true' })}
                                                className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white"
                                            >
                                                <option value="false">{locale === 'ar' ? 'لا (False)' : 'No (False)'}</option>
                                                <option value="true">{locale === 'ar' ? 'نعم (True)' : 'Yes (True)'}</option>
                                            </select>
                                        ) : col.type === 'number' ? (
                                            <input
                                                id={fieldId}
                                                type="number"
                                                value={Number.isFinite(val as number) ? String(val) : ''}
                                                placeholder={col.placeholder}
                                                onChange={(e) => setModalData({ ...modalData, [col.key]: e.target.value === '' ? 0 : Number(e.target.value) })}
                                                className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white font-mono"
                                            />
                                        ) : col.type === 'date' ? (
                                            <input
                                                id={fieldId}
                                                type="date"
                                                value={(val as string) ?? ''}
                                                onChange={(e) => setModalData({ ...modalData, [col.key]: e.target.value })}
                                                className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white font-mono"
                                            />
                                        ) : col.type === 'searchable-select' ? (
                                            <SearchableSelect
                                                apiUrl={col.apiUrl ?? ''}
                                                value={(val as string) ?? ''}
                                                onSelect={(id) => setModalData({ ...modalData, [col.key]: id })}
                                                placeholder={col.placeholder ?? 'Search...'}
                                            />
                                        ) : (
                                            <input
                                                id={fieldId}
                                                type="text"
                                                value={(val as string) ?? ''}
                                                placeholder={col.placeholder}
                                                readOnly={col.readOnly}
                                                onChange={(e) => setModalData({ ...modalData, [col.key]: e.target.value })}
                                                className={cn(
                                                    "w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white",
                                                    col.readOnly && "opacity-60 cursor-not-allowed"
                                                )}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                type="button"
                                onClick={saveModalRecord}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm"
                            >
                                <Check className="w-3.5 h-3.5" />
                                {editingIndex === null
                                    ? (locale === 'ar' ? 'حفظ السجل' : 'Save Record')
                                    : (locale === 'ar' ? 'تحديث السجل' : 'Update Record')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Async searchable-select — used by the 'searchable-select' column type.
 * Debounces input, queries `apiUrl?search=...&limit=10`, and lets the user
 * pick a result. Accepts either `{ data: [...] }` or `{ data: { items: [...] } }`
 * response shapes.
 */
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-2.5 py-1.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30"
            />
            {open && (query.length >= 2) && (
                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
                    {loading && <div className="px-2 py-1 text-xs text-slate-500">Searching…</div>}
                    {!loading && results.length === 0 && (
                        <div className="px-2 py-1 text-xs text-slate-500">No results</div>
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
                            className="block w-full text-left px-2 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}