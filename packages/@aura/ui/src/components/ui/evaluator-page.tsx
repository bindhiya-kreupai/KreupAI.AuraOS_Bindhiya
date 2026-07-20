'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { VerdictPanel, type VerdictPanelProps } from './verdict-panel';
import { StructuredArrayEditor, type StructuredColumn } from './structured-array-editor';
import { SkeletonVerdict } from './skeleton';
import { ErrorState, type ZodFlattenedShape } from './error-state';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type EvaluatorFieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'date'
    | 'datetime-local'
    | 'select'
    | 'boolean'
    | 'structured-array';

export interface EvaluatorField {
    name: string;
    label: string;
    labelAr?: string;
    type: EvaluatorFieldType;
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    defaultValue?: string;
    helpText?: string;
    helpTextAr?: string;
    columns?: StructuredColumn[];
    defaultRows?: Array<Record<string, unknown>>;
    minRows?: number;
    maxRows?: number;
}

export interface EvaluatorEndpoint {
    method: 'GET' | 'POST';
    url: string;
}

export interface EvaluatorPageProps {
    title: string;
    titleAr?: string;
    description?: string;
    descriptionAr?: string;
    fields: EvaluatorField[];
    endpoint: EvaluatorEndpoint;
    buildPayload: (values: Record<string, unknown>) => unknown;
    buildVerdict: (data: unknown) => VerdictPanelProps | null;
    buildQuery?: (values: Record<string, unknown>) => string;
    submitLabel?: string;
    submitLabelAr?: string;
    locale?: 'en' | 'ar';
    className?: string;
    onSuccess?: (data: any, setValues: React.Dispatch<React.SetStateAction<Record<string, unknown>>>) => void;
}

export function EvaluatorPage({
    title,
    titleAr,
    description,
    descriptionAr,
    fields,
    endpoint,
    buildPayload,
    buildVerdict,
    buildQuery,
    submitLabel,
    submitLabelAr,
    locale = 'en',
    className,
    onSuccess,
}: EvaluatorPageProps) {
    const [values, setValues] = useState<Record<string, unknown>>(() => {
        const out: Record<string, unknown> = {};
        for (const f of fields) {
            if (f.type === 'structured-array') {
                out[f.name] = f.defaultRows ?? [];
            } else {
                out[f.name] = f.defaultValue ?? '';
            }
        }
        return out;
    });
    const [verdict, setVerdict] = useState<VerdictPanelProps | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorIssues, setErrorIssues] = useState<ZodFlattenedShape | null>(null);
    const [loading, setLoading] = useState(false);

    const displayTitle = locale === 'ar' && titleAr ? titleAr : title;
    const displayDesc =
        locale === 'ar' && descriptionAr ? descriptionAr : description;
    const displaySubmit =
        locale === 'ar' && submitLabelAr
            ? submitLabelAr
            : (submitLabel ?? (locale === 'ar' ? 'تقييم' : 'Evaluate'));

    function onChange(name: string, value: unknown) {
        setValues((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setVerdict(null);
        setError(null);
        setErrorIssues(null);
        for (const f of fields) {
            if (!f.required) continue;
            const v = values[f.name];
            const missing =
                v === undefined ||
                v === null ||
                v === '' ||
                (Array.isArray(v) && v.length === 0);
            if (missing) {
                setError(
                    locale === 'ar'
                        ? `الحقل "${f.labelAr ?? f.label}" مطلوب`
                        : `Field "${f.label}" is required`,
                );
                return;
            }
        }
        setLoading(true);
        try {
            const url =
                endpoint.method === 'GET' && buildQuery
                    ? `${endpoint.url}?${buildQuery(values)}`
                    : endpoint.url;
            const res = await fetch(url, {
                method: endpoint.method,
                headers:
                    endpoint.method === 'POST'
                        ? { 'Content-Type': 'application/json' }
                        : undefined,
                body:
                    endpoint.method === 'POST'
                        ? JSON.stringify(buildPayload(values))
                        : undefined,
            });
            const json = await res.json();
            if (!json.success) {
                setError(
                    json.error?.message ??
                        (locale === 'ar' ? 'فشل التقييم' : 'Evaluation failed'),
                );
                const details = json.error?.details?.issues;
                if (
                    details &&
                    typeof details === 'object' &&
                    'fieldErrors' in details &&
                    'formErrors' in details
                ) {
                    setErrorIssues(details as ZodFlattenedShape);
                }
                return;
            }
            const v = buildVerdict(json.data);
            setVerdict(v);
            if (onSuccess) {
                onSuccess(json.data, setValues);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : locale === 'ar'
                      ? 'خطأ في الشبكة'
                      : 'Network error',
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className={cn('p-8 space-y-6 w-full max-w-7xl mx-auto bg-[#f8fafc] dark:bg-slate-950 min-h-screen rounded-2xl transition-colors duration-200', className)}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
            <header className="pb-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                    EVALUATOR WORKSPACE
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{displayTitle}</h1>
                {displayDesc && (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{displayDesc}</p>
                )}
            </header>
            
            <form
                onSubmit={onSubmit}
                className="space-y-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            >
                {fields.map((f) => {
                    const id = `evaluator-field-${f.name}`;
                    const label = locale === 'ar' && f.labelAr ? f.labelAr : f.label;
                    const help = locale === 'ar' && f.helpTextAr ? f.helpTextAr : f.helpText;

                    if (f.type === 'structured-array') {
                        const rows = (values[f.name] as Array<Record<string, unknown>>) ?? [];
                        return (
                            <div key={f.name} className="space-y-1">
                                <StructuredArrayEditor
                                    columns={f.columns ?? []}
                                    value={rows}
                                    onChange={(next) => onChange(f.name, next)}
                                    label={f.label}
                                    labelAr={f.labelAr}
                                    helpText={f.helpText}
                                    helpTextAr={f.helpTextAr}
                                    minRows={f.minRows}
                                    maxRows={f.maxRows}
                                    locale={locale}
                                    disabled={loading}
                                />
                            </div>
                        );
                    }

                    const stringValue = (values[f.name] as string) ?? '';

                    return (
                        <div key={f.name} className="space-y-2">
                            <label
                                htmlFor={id}
                                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                                {label}
                                {f.required && (
                                    <span className="text-rose-605" aria-hidden>
                                        {' '}
                                        *
                                    </span>
                                )}
                            </label>
                            {f.type === 'select' && f.options ? (
                                <select
                                    id={id}
                                    className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={stringValue}
                                    onChange={(e) => onChange(f.name, e.target.value)}
                                    required={f.required}
                                    disabled={loading}
                                >
                                    <option value="">{locale === 'ar' ? 'اختر…' : 'Select…'}</option>
                                    {f.options.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            ) : f.type === 'boolean' ? (
                                <select
                                    id={id}
                                    className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={stringValue}
                                    onChange={(e) => onChange(f.name, e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">{locale === 'ar' ? 'اختر…' : 'Select…'}</option>
                                    <option value="true">{locale === 'ar' ? 'نعم' : 'Yes'}</option>
                                    <option value="false">{locale === 'ar' ? 'لا' : 'No'}</option>
                                </select>
                            ) : f.type === 'textarea' ? (
                                <textarea
                                    id={id}
                                    rows={6}
                                    className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-sm font-mono bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={stringValue}
                                    onChange={(e) => onChange(f.name, e.target.value)}
                                    placeholder={f.placeholder}
                                    required={f.required}
                                    disabled={loading}
                                />
                            ) : (
                                <input
                                    id={id}
                                    type={f.type}
                                    className="w-full border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={stringValue}
                                    onChange={(e) => onChange(f.name, e.target.value)}
                                    placeholder={f.placeholder}
                                    required={f.required}
                                    disabled={loading}
                                />
                            )}
                            {help && <p className="text-xs text-slate-450 dark:text-slate-500 pt-0.5">{help}</p>}
                        </div>
                    );
                })}
                {error && (
                    <ErrorState
                        title={locale === 'ar' ? 'فشل التقييم' : 'Could not evaluate'}
                        titleAr="فشل التقييم"
                        message={error}
                        issues={errorIssues}
                        locale={locale}
                    />
                )}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 px-5 py-3 text-sm font-semibold transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {displaySubmit}
                    </button>
                </div>
            </form>
            {loading && !verdict && <SkeletonVerdict />}
            {verdict && <VerdictPanel {...verdict} locale={locale} />}
        </div>
    );
}
