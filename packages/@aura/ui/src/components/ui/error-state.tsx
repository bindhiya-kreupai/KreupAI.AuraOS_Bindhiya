import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Generic error-state card.
 *
 * Used in place of a bare red text banner when a fetch / mutation
 * fails. Replaces the inline error-banner div in EvaluatorPage with
 * something that scans visually (icon, title, action), reads with
 * a screen-reader (role=alert), and exposes the optional
 * field-level Zod issues as a collapsed details block.
 *
 * Three configurations:
 *
 *   <ErrorState title="Network error" message="Could not reach the API" />
 *
 *   <ErrorState title="Invalid input" issues={parsed.error.flatten()} />
 *
 *   <ErrorState title="..." message="..." onRetry={() => refetch()} />
 */

export interface ZodFlattenedShape {
    formErrors: string[];
    fieldErrors: Record<string, string[]>;
}

export interface ErrorStateProps {
    title: string;
    titleAr?: string;
    message?: string;
    messageAr?: string;
    /** When supplied, renders a details block listing the per-field errors. */
    issues?: ZodFlattenedShape | null;
    /** Optional retry handler. Renders a button when supplied. */
    onRetry?: () => void;
    locale?: 'en' | 'ar';
    /** Visual tone — 'danger' (default) or 'warning'. */
    tone?: 'danger' | 'warning';
    className?: string;
}

const TONE_CLASS: Record<NonNullable<ErrorStateProps['tone']>, string> = {
    danger: 'border-rose-300 bg-rose-50 text-rose-900',
    warning: 'border-amber-300 bg-amber-50 text-amber-950',
};
const ICON_TONE: Record<NonNullable<ErrorStateProps['tone']>, string> = {
    danger: 'text-rose-600',
    warning: 'text-amber-600',
};

export function ErrorState({
    title,
    titleAr,
    message,
    messageAr,
    issues,
    onRetry,
    locale = 'en',
    tone = 'danger',
    className,
}: ErrorStateProps) {
    const displayTitle = locale === 'ar' && titleAr ? titleAr : title;
    const displayMessage = locale === 'ar' && messageAr ? messageAr : message;
    const retryLabel = locale === 'ar' ? 'إعادة المحاولة' : 'Retry';
    const detailsLabel =
        locale === 'ar' ? 'تفاصيل التحقق' : 'Validation details';

    const hasFieldErrors =
        !!issues &&
        (issues.formErrors.length > 0 ||
            Object.keys(issues.fieldErrors).length > 0);

    return (
        <div
            role="alert"
            className={cn(
                'rounded-md border p-4 flex items-start gap-3',
                TONE_CLASS[tone],
                className,
            )}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
            <AlertOctagon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', ICON_TONE[tone])} aria-hidden />
            <div className="flex-1 min-w-0 space-y-2">
                <h3 className="text-sm font-semibold">{displayTitle}</h3>
                {displayMessage && (
                    <p className="text-sm leading-relaxed">{displayMessage}</p>
                )}
                {hasFieldErrors && (
                    <details className="text-xs">
                        <summary className="cursor-pointer font-medium">
                            {detailsLabel}
                        </summary>
                        <div className="mt-2 space-y-1.5">
                            {issues!.formErrors.length > 0 && (
                                <ul className="list-disc list-inside">
                                    {issues!.formErrors.map((m, i) => (
                                        <li key={i}>{m}</li>
                                    ))}
                                </ul>
                            )}
                            {Object.entries(issues!.fieldErrors).map(([field, msgs]) => (
                                <div key={field}>
                                    <span className="font-mono font-semibold">{field}:</span>{' '}
                                    {msgs.join('; ')}
                                </div>
                            ))}
                        </div>
                    </details>
                )}
                {onRetry && (
                    <div>
                        <button
                            type="button"
                            onClick={onRetry}
                            className="inline-flex items-center gap-1 rounded-md bg-white/70 border border-current/40 px-2.5 py-1 text-xs font-medium hover:bg-white"
                        >
                            <RefreshCw className="w-3 h-3" />
                            {retryLabel}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
