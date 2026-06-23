import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending';

export interface StatusBadgeProps {
    /** English label */
    labelEn: string;
    /** Arabic label (falls back to labelEn when omitted) */
    labelAr?: string;
    /** Active locale; falls back to document.documentElement.lang at render time */
    locale?: 'en' | 'ar';
    /** Visual tone */
    tone?: StatusTone;
    /** Optional leading dot indicator */
    dot?: boolean;
    className?: string;
}

const toneClasses: Record<StatusTone, string> = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    warning: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    danger: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30',
    info: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
    neutral: 'bg-pearl text-ink-black ring-cloud dark:bg-deep-cosmos dark:text-pearl dark:ring-nebula-purple/40',
    pending: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30',
};

const dotClasses: Record<StatusTone, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-silver-mist',
    pending: 'bg-violet-500',
};

function resolveLocale(prop?: 'en' | 'ar'): 'en' | 'ar' {
    if (prop) return prop;
    if (typeof document !== 'undefined') {
        const lang = document.documentElement.lang?.toLowerCase();
        if (lang?.startsWith('ar')) return 'ar';
    }
    return 'en';
}

/**
 * Bilingual status badge. Renders the locale-appropriate label with a tone-coloured
 * pill. Use the same component everywhere instead of each module inventing its own
 * status-label markup.
 */
export function StatusBadge({
    labelEn,
    labelAr,
    locale,
    tone = 'neutral',
    dot = false,
    className,
}: StatusBadgeProps) {
    const resolved = resolveLocale(locale);
    const label = resolved === 'ar' && labelAr ? labelAr : labelEn;
    const isRtl = resolved === 'ar' && Boolean(labelAr);

    return (
        <span
            dir={isRtl ? 'rtl' : undefined}
            className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap',
                toneClasses[tone],
                className,
            )}
        >
            {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotClasses[tone])} aria-hidden />}
            {label}
        </span>
    );
}
