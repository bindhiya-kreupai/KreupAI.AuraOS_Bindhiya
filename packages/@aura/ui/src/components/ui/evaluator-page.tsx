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

/**
 * Generic evaluator page template.
 *
 * Single component that powers every "type input → call service → show
 * verdict" dashboard page across the 27 EPIC closures. Each adopter
 * page is a thin config wrapper around <EvaluatorPage>.
 *
 * Usage (per page):
 *
 *   <EvaluatorPage
 *     title="Benefits eligibility"
 *     titleAr="أهلية المزايا"
 *     description="Evaluate one benefit code against an employee context."
 *     fields={[
 *       { name: 'benefitCode', label: 'Benefit code', type: 'text', required: true },
 *       { name: 'tenureMonths', label: 'Tenure (months)', type: 'number', required: true },
 *       ...
 *     ]}
 *     endpoint={{ method: 'POST', url: '/api/v1/benefits-compliance/eligibility' }}
 *     buildPayload={(values) => ({
 *       action: 'evaluate',
 *       benefitCode: values.benefitCode,
 *       context: { employee: { id: values.employeeId, tenureMonths: values.tenureMonths } },
 *     })}
 *     buildVerdict={(data) => ({
 *       outcome: data.verdict?.eligible ? 'PASS' : 'FAIL',
 *       title: data.verdict?.reasonCode ?? 'Result',
 *       reason: data.verdict?.reason ?? '',
 *       reasonAr: data.verdict?.reasonAr,
 *     })}
 *   />
 */

export type EvaluatorFieldType =
    | 'text'
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
    /** Default value (string form for scalar fields). */
    defaultValue?: string;
    /** Help text shown under the field. */
    helpText?: string;
    helpTextAr?: string;
    /** Column definitions for 'structured-array' fields. */
    columns?: StructuredColumn[];
    /** Default rows for 'structured-array' fields. */
    defaultRows?: Array<Record<string, unknown>>;
    /** Minimum / maximum row counts for 'structured-array' fields. */
    minRows?: number;
    maxRows?: number;
}

export interface EvaluatorEndpoint {
    method: 'GET' | 'POST';
    /** Absolute path under /api. */
    url: string;
}

export interface EvaluatorPageProps {
    title: string;
    titleAr?: string;
    description?: string;
    descriptionAr?: string;
    fields: EvaluatorField[];
    endpoint: EvaluatorEndpoint;
    /**
     * Transforms form values into the request body. For scalar fields the
     * value is a string; for `structured-array` fields it is an array of
     * row records.
     */
    buildPayload: (values: Record<string, unknown>) => unknown;
    /** Transforms the API response data into a VerdictPanelProps shape. */
    buildVerdict: (data: unknown) => VerdictPanelProps | null;
    /** Optional GET-style URL builder for endpoints that take query params. */
    buildQuery?: (values: Record<string, unknown>) => string;
    /** Optional submit-button label. */
    submitLabel?: string;
    submitLabelAr?: string;
    locale?: 'en' | 'ar';
    className?: string;
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
        // Light required validation.
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
                // Surface Zod-validation field issues when the API returned them.
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
            className={cn('p-6 space-y-6 max-w-3xl', className)}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
            <header>
                <h1 className="text-2xl font-semibold text-gray-900">{displayTitle}</h1>
                {displayDesc && (
                    <p className="mt-1 text-sm text-gray-600">{displayDesc}</p>
                )}
            </header>
            <form
                onSubmit={onSubmit}
                className="space-y-4 rounded-md border border-gray-200 bg-white p-4"
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
                                />
                            </div>
                        );
                    }

                    const stringValue = (values[f.name] as string) ?? '';

                    return (
                        <div key={f.name} className="space-y-1">
                            <label
                                htmlFor={id}
                                className="block text-sm font-medium text-gray-800"
                            >
                                {label}
                                {f.required && (
                                    <span className="text-rose-600" aria-hidden>
                                        {' '}
                                        *
                                    </span>
                                )}
                            </label>
                            {f.type === 'select' && f.options ? (
                                <select
                                    id={id}
                                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
                                    value={stringValue}
                                    onChange={(e) => onChange(f.name, e.target.value)}
                                    required={f.required}
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
                                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
                                    value={stringValue}
                                    onChange={(e) => onChange(f.name, e.target.value)}
                                >
                                    <option value="">{locale === 'ar' ? 'اختر…' : 'Select…'}</option>
                                    <option value="true">{locale === 'ar' ? 'نعم' : 'Yes'}</option>
                                    <option value="false">{locale === 'ar' ? 'لا' : 'No'}</option>
                                </select>
                            ) : (
                                <input
                                    id={id}
                                    type={f.type}
                                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                                    value={stringValue}
                                    onChange={(e) => onChange(f.name, e.target.value)}
                                    placeholder={f.placeholder}
                                    required={f.required}
                                />
                            )}
                            {help && <p className="text-xs text-gray-500">{help}</p>}
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
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
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
