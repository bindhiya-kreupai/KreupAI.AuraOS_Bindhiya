'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, ChevronDown, Filter, Loader2, Plus, Trash2, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type FilterFieldType = 'text' | 'select' | 'multiselect' | 'number' | 'date' | 'boolean';

export interface FilterFieldDef {
    /** Stable key used in the filter payload. */
    key: string;
    /** Human label displayed in the filter row. */
    label: string;
    /** Field type — drives the input control. */
    type: FilterFieldType;
    /** Options for select / multiselect. */
    options?: Array<{ value: string; label: string }>;
    /** Placeholder for text / number / date fields. */
    placeholder?: string;
}

export interface SavedViewSummary {
    id: string;
    name: string;
    isDefault: boolean;
    isShared: boolean;
    filters: Record<string, unknown>;
}

export interface FilterPanelProps {
    /** Field definitions the panel can edit. */
    fields: FilterFieldDef[];
    /** Current filter value object. */
    value: Record<string, unknown>;
    /** Called whenever the user edits the filter (including reset). */
    onChange: (next: Record<string, unknown>) => void;

    // ── Saved views (optional). When supplied, a "Saved views" dropdown
    //    renders inside the panel header.
    /** List of saved views for the current page scope. */
    savedViews?: SavedViewSummary[];
    /** Currently selected saved view id (null = ad-hoc filter, no view). */
    activeViewId?: string | null;
    /** Called when the user picks a saved view from the dropdown. */
    onPickSavedView?: (id: string | null) => void;
    /** Called when the user clicks "Save current filter as a view". */
    onSaveView?: (name: string, filters: Record<string, unknown>) => Promise<void> | void;
    /** Called when the user deletes a saved view. */
    onDeleteSavedView?: (id: string) => Promise<void> | void;

    /** Render in compact mode (no labels above inputs). */
    compact?: boolean;
    className?: string;
}

const operatorLabels: Record<FilterFieldType, string> = {
    text: 'contains',
    select: 'is',
    multiselect: 'in',
    number: 'equals',
    date: 'on',
    boolean: 'is',
};

/**
 * Reusable filter row + saved-view dropdown. Consumer supplies the field
 * definitions and current value; the panel renders the inputs, reset
 * button, and (optionally) the saved-view dropdown.
 *
 * Designed to live above DataTable / DataPage. Returns the filter
 * payload via `onChange` — caller passes the same payload to its list
 * query so server-side filtering stays the source of truth.
 */
export function FilterPanel({
    fields,
    value,
    onChange,
    savedViews,
    activeViewId = null,
    onPickSavedView,
    onSaveView,
    onDeleteSavedView,
    compact = false,
    className,
}: FilterPanelProps) {
    const [savedOpen, setSavedOpen] = useState(false);
    const [savePromptOpen, setSavePromptOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!savedOpen) return;
        function onDocClick(e: MouseEvent) {
            if (!wrapperRef.current?.contains(e.target as Node)) setSavedOpen(false);
        }
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [savedOpen]);

    const hasActiveFilters = useMemo(
        () => Object.values(value).some((v) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)),
        [value],
    );

    const updateField = useCallback(
        (key: string, next: unknown) => {
            const merged = { ...value };
            if (next === '' || next === null || next === undefined || (Array.isArray(next) && next.length === 0)) {
                delete merged[key];
            } else {
                merged[key] = next;
            }
            onChange(merged);
        },
        [onChange, value],
    );

    function reset() {
        onChange({});
        onPickSavedView?.(null);
    }

    async function handleSave() {
        if (!onSaveView || !newName.trim()) return;
        setSaving(true);
        try {
            await onSaveView(newName.trim(), value);
            setNewName('');
            setSavePromptOpen(false);
        } finally {
            setSaving(false);
        }
    }

    const activeView = savedViews?.find((v) => v.id === activeViewId);

    return (
        <div
            ref={wrapperRef}
            className={cn(
                'rounded-xl border border-cloud dark:border-nebula-purple/40 bg-white dark:bg-stellar-blue',
                compact ? 'p-2.5' : 'p-3',
                className,
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-celestial-indigo" />
                    <span className="text-sm font-semibold text-ink-black dark:text-pearl">Filters</span>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={reset}
                            className="inline-flex items-center gap-1 text-xs text-silver-mist hover:text-rose-500 transition-colors"
                        >
                            <X className="w-3 h-3" /> Reset
                        </button>
                    )}
                </div>

                {savedViews && onPickSavedView && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setSavedOpen((v) => !v)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10"
                        >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>{activeView ? activeView.name : 'Saved views'}</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {savedOpen && (
                            <div className="absolute right-0 mt-1 z-30 min-w-[220px] bg-white dark:bg-stellar-blue rounded-lg shadow-lg ring-1 ring-cloud dark:ring-nebula-purple/40 overflow-hidden">
                                <ul className="max-h-72 overflow-y-auto">
                                    {savedViews.length === 0 && (
                                        <li className="px-3 py-2 text-xs text-silver-mist">No saved views yet.</li>
                                    )}
                                    {savedViews.map((v) => (
                                        <li key={v.id} className="flex items-stretch">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onPickSavedView(v.id);
                                                    setSavedOpen(false);
                                                }}
                                                className={cn(
                                                    'flex-1 flex items-center gap-2 px-3 py-2 text-sm text-left text-ink-black dark:text-pearl hover:bg-pearl dark:hover:bg-deep-cosmos',
                                                    v.id === activeViewId && 'font-semibold',
                                                )}
                                            >
                                                <span className="flex-1 truncate">{v.name}</span>
                                                {v.isDefault && (
                                                    <span className="text-[10px] uppercase text-celestial-indigo tracking-wide">default</span>
                                                )}
                                                {v.isShared && (
                                                    <span className="text-[10px] uppercase text-silver-mist tracking-wide">shared</span>
                                                )}
                                            </button>
                                            {onDeleteSavedView && (
                                                <button
                                                    type="button"
                                                    onClick={() => onDeleteSavedView(v.id)}
                                                    aria-label={`Delete view ${v.name}`}
                                                    className="px-2 text-silver-mist hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {onSaveView && (
                                    <div className="border-t border-cloud dark:border-nebula-purple/40 p-2">
                                        {savePromptOpen ? (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    placeholder="Name this view"
                                                    className="flex-1 px-2 py-1 text-xs bg-pearl dark:bg-deep-cosmos rounded-md focus:ring-2 focus:ring-celestial-indigo/50 placeholder:text-silver-mist text-ink-black dark:text-pearl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSave}
                                                    disabled={!newName.trim() || saving}
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-celestial-indigo text-white hover:bg-celestial-indigo/90 disabled:opacity-50"
                                                >
                                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setSavePromptOpen(true)}
                                                disabled={!hasActiveFilters}
                                                className="w-full flex items-center justify-center gap-1.5 px-2 py-1 text-xs text-celestial-indigo hover:bg-celestial-indigo/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Save current as view
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filter fields */}
            <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3')}>
                {fields.map((f) => (
                    <FilterField key={f.key} field={f} value={value[f.key]} onChange={(next) => updateField(f.key, next)} compact={compact} />
                ))}
            </div>
        </div>
    );
}

function FilterField({
    field,
    value,
    onChange,
    compact,
}: {
    field: FilterFieldDef;
    value: unknown;
    onChange: (v: unknown) => void;
    compact: boolean;
}) {
    const inputClass =
        'w-full px-2.5 py-1.5 text-sm bg-pearl dark:bg-deep-cosmos rounded-lg border-none focus:ring-2 focus:ring-celestial-indigo/50 placeholder:text-silver-mist text-ink-black dark:text-pearl';

    return (
        <label className="block">
            {!compact && (
                <div className="text-xs text-silver-mist mb-1">
                    {field.label} <span className="text-[10px] uppercase tracking-wide ml-1 opacity-70">{operatorLabels[field.type]}</span>
                </div>
            )}
            {field.type === 'text' && (
                <input
                    type="text"
                    value={(value as string) ?? ''}
                    placeholder={field.placeholder ?? field.label}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass}
                />
            )}
            {field.type === 'number' && (
                <input
                    type="number"
                    value={(value as number | string) ?? ''}
                    placeholder={field.placeholder ?? field.label}
                    onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    className={inputClass}
                />
            )}
            {field.type === 'date' && (
                <input
                    type="date"
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass}
                />
            )}
            {field.type === 'select' && (
                <select value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass}>
                    <option value="">All</option>
                    {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            )}
            {field.type === 'multiselect' && (
                <select
                    multiple
                    value={(value as string[]) ?? []}
                    onChange={(e) =>
                        onChange(Array.from(e.target.selectedOptions, (opt) => opt.value).filter(Boolean))
                    }
                    className={cn(inputClass, 'min-h-[5rem]')}
                >
                    {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            )}
            {field.type === 'boolean' && (
                <select
                    value={value === undefined || value === null ? '' : String(Boolean(value))}
                    onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value === 'true')}
                    className={inputClass}
                >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            )}
        </label>
    );
}
