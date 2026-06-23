import React from 'react';
import { AlertCircle, CheckCircle2, Info, ShieldAlert, XCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Shared verdict-panel primitive.
 *
 * Renders the typed result of any of the 27 service evaluators
 * (eligibility, retaliation, penalty matrix, fatigue, period lock,
 * recruitment stage gate, ...). Each verdict is a small object with
 * an outcome (allow / eligible / pass / breach), an optional severity
 * band, and a bilingual reason. This component normalises them into
 * a consistent visual.
 *
 * Tone is picked from `tone` if supplied, else derived from `outcome`
 * (PASS → success, FAIL → danger, WARN → warning, INFO → info). The
 * bilingual reason is rendered per the active locale and falls back
 * to the English value when the Arabic side is omitted.
 */

export type VerdictOutcome = 'PASS' | 'FAIL' | 'WARN' | 'INFO';

export type VerdictTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface VerdictBreakdownEntry {
    label: string;
    labelAr?: string;
    value: string | number;
}

export interface VerdictPanelProps {
    outcome: VerdictOutcome;
    /** Headline displayed at the top of the panel. */
    title: string;
    titleAr?: string;
    /** Bilingual reason / explanation. */
    reason: string;
    reasonAr?: string;
    /** Optional severity / band pill (e.g. CRITICAL, HIGH, MEDIUM, LOW). */
    severity?: string;
    /** Optional structured breakdown rendered as a small definition list. */
    breakdown?: VerdictBreakdownEntry[];
    /** Override tone derived from outcome. */
    tone?: VerdictTone;
    locale?: 'en' | 'ar';
    /** Optional metadata pill (e.g. "Country: AE"). */
    meta?: Array<{ label: string; value: string }>;
    className?: string;
}

const TONE_BY_OUTCOME: Record<VerdictOutcome, VerdictTone> = {
    PASS: 'success',
    FAIL: 'danger',
    WARN: 'warning',
    INFO: 'info',
};

const TONE_CONTAINER: Record<VerdictTone, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    danger: 'border-rose-200 bg-rose-50 text-rose-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-950',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    neutral: 'border-gray-200 bg-gray-50 text-gray-900',
};

const TONE_PILL: Record<VerdictTone, string> = {
    success: 'bg-emerald-600 text-white',
    danger: 'bg-rose-600 text-white',
    warning: 'bg-amber-500 text-amber-950',
    info: 'bg-sky-600 text-white',
    neutral: 'bg-gray-500 text-white',
};

const TONE_ICON: Record<VerdictTone, any> = {
    success: CheckCircle2,
    danger: XCircle,
    warning: ShieldAlert,
    info: Info,
    neutral: AlertCircle,
};

const OUTCOME_LABEL: Record<VerdictOutcome, { en: string; ar: string }> = {
    PASS: { en: 'Pass', ar: 'مقبول' },
    FAIL: { en: 'Fail', ar: 'مرفوض' },
    WARN: { en: 'Warning', ar: 'تحذير' },
    INFO: { en: 'Info', ar: 'معلومة' },
};

export function VerdictPanel({
    outcome,
    title,
    titleAr,
    reason,
    reasonAr,
    severity,
    breakdown,
    tone: toneProp,
    locale = 'en',
    meta,
    className,
}: VerdictPanelProps) {
    const tone = toneProp ?? TONE_BY_OUTCOME[outcome];
    const Icon = TONE_ICON[tone];
    const displayTitle = locale === 'ar' && titleAr ? titleAr : title;
    const displayReason = locale === 'ar' && reasonAr ? reasonAr : reason;

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn('rounded-md border p-4', TONE_CONTAINER[tone], className)}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
            <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-sm font-semibold">{displayTitle}</h3>
                        <span
                            className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                                TONE_PILL[tone],
                            )}
                            aria-label={`outcome ${outcome}`}
                        >
                            {OUTCOME_LABEL[outcome][locale]}
                        </span>
                        {severity && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded border border-current/40 text-xs font-medium uppercase tracking-wide">
                                {severity}
                            </span>
                        )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{displayReason}</p>
                    {meta && meta.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {meta.map((m) => (
                                <li
                                    key={m.label}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/70 border border-current/30 text-xs"
                                >
                                    <span className="font-semibold mr-1">{m.label}:</span>
                                    {m.value}
                                </li>
                            ))}
                        </ul>
                    )}
                    {breakdown && breakdown.length > 0 && (
                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            {breakdown.map((b) => (
                                <React.Fragment key={b.label}>
                                    <dt className="font-medium text-current/80">
                                        {locale === 'ar' && b.labelAr ? b.labelAr : b.label}
                                    </dt>
                                    <dd className="text-right tabular-nums">{b.value}</dd>
                                </React.Fragment>
                            ))}
                        </dl>
                    )}
                </div>
            </div>
        </div>
    );
}
