import React from 'react';
import { AlertTriangle, Bell, Clock, Flame, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Severity-ordered alert timeline.
 *
 * Designed for EPIC-29 visa renewal alerts (T-60 / 30 / 15 / 7 / 1 /
 * +1 windows) but generic enough to render any (severity, message,
 * code, timestamp) tuple list:
 *
 *   <AlertTimeline
 *     items={[{ id, severity, code, message, messageAr?, daysFromNow,
 *               dependents?, onClick? }, ...]}
 *     locale="en"
 *   />
 *
 * The component groups items by severity band (CRITICAL → INFO),
 * shows a count badge per band, and renders each item with its
 * code + days-from-now + bilingual message.
 */

export type AlertSeverity =
    | 'CRITICAL'
    | 'URGENT'
    | 'WARNING'
    | 'INFO'
    | 'OVERDUE';

export interface AlertTimelineItem {
    id: string;
    severity: AlertSeverity;
    code: string;
    message: string;
    messageAr?: string;
    daysFromNow?: number;
    /** Optional dependent / cascade detail (e.g. dependent visas). */
    dependents?: Array<{ id: string; label: string }>;
    onClick?: () => void;
}

export interface AlertTimelineProps {
    items: AlertTimelineItem[];
    locale?: 'en' | 'ar';
    /** Custom severity order (default: CRITICAL > OVERDUE > URGENT > WARNING > INFO). */
    severityOrder?: AlertSeverity[];
    /** Hide the count badges shown in the section headers. */
    hideCounts?: boolean;
    className?: string;
}

const DEFAULT_ORDER: AlertSeverity[] = [
    'CRITICAL',
    'OVERDUE',
    'URGENT',
    'WARNING',
    'INFO',
];

const TONE: Record<AlertSeverity, { row: string; pill: string; icon: any }> = {
    CRITICAL: {
        row: 'border-red-300 bg-red-50',
        pill: 'bg-red-600 text-white',
        icon: Flame,
    },
    OVERDUE: {
        row: 'border-rose-300 bg-rose-50',
        pill: 'bg-rose-700 text-white',
        icon: AlertTriangle,
    },
    URGENT: {
        row: 'border-orange-300 bg-orange-50',
        pill: 'bg-orange-500 text-white',
        icon: AlertTriangle,
    },
    WARNING: {
        row: 'border-amber-300 bg-amber-50',
        pill: 'bg-amber-400 text-amber-950',
        icon: Bell,
    },
    INFO: {
        row: 'border-sky-300 bg-sky-50',
        pill: 'bg-sky-300 text-sky-900',
        icon: Info,
    },
};

const SECTION_LABEL: Record<AlertSeverity, { en: string; ar: string }> = {
    CRITICAL: { en: 'Critical', ar: 'حرج' },
    OVERDUE: { en: 'Overdue', ar: 'متأخر' },
    URGENT: { en: 'Urgent', ar: 'عاجل' },
    WARNING: { en: 'Warning', ar: 'تحذير' },
    INFO: { en: 'Info', ar: 'معلومة' },
};

function daysLabel(d: number | undefined, locale: 'en' | 'ar'): string {
    if (d === undefined) return '';
    if (locale === 'ar') {
        if (d === 0) return 'اليوم';
        if (d < 0) return `منذ ${Math.abs(d)} يوم`;
        return `بعد ${d} يوم`;
    }
    if (d === 0) return 'today';
    if (d < 0) return `${Math.abs(d)}d ago`;
    return `in ${d}d`;
}

export function AlertTimeline({
    items,
    locale = 'en',
    severityOrder,
    hideCounts,
    className,
}: AlertTimelineProps) {
    const order = severityOrder ?? DEFAULT_ORDER;
    const grouped = new Map<AlertSeverity, AlertTimelineItem[]>();
    for (const sev of order) grouped.set(sev, []);
    for (const item of items) {
        if (!grouped.has(item.severity)) grouped.set(item.severity, []);
        grouped.get(item.severity)!.push(item);
    }

    if (items.length === 0) {
        return (
            <div
                className={cn(
                    'rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500',
                    className,
                )}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
                {locale === 'ar' ? 'لا توجد تنبيهات حالياً' : 'No alerts to display'}
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {order.map((sev) => {
                const bucket = grouped.get(sev) ?? [];
                if (bucket.length === 0) return null;
                const Icon = TONE[sev].icon;
                return (
                    <section key={sev}>
                        <h3 className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-800">
                                {SECTION_LABEL[sev][locale]}
                            </span>
                            {!hideCounts && (
                                <span
                                    className={cn(
                                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                                        TONE[sev].pill,
                                    )}
                                >
                                    {bucket.length}
                                </span>
                            )}
                        </h3>
                        <ul className="space-y-2">
                            {bucket.map((item) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={item.onClick}
                                        disabled={!item.onClick}
                                        className={cn(
                                            'w-full text-left rounded-md border p-3 transition-shadow hover:ring-1 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-default disabled:hover:ring-0',
                                            TONE[sev].row,
                                        )}
                                    >
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                            <span className="font-mono text-[0.7rem] uppercase tracking-wide">
                                                {item.code}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {daysLabel(item.daysFromNow, locale)}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-800">
                                            {locale === 'ar' && item.messageAr
                                                ? item.messageAr
                                                : item.message}
                                        </div>
                                        {item.dependents && item.dependents.length > 0 && (
                                            <ul className="mt-2 flex flex-wrap gap-1.5">
                                                {item.dependents.map((d) => (
                                                    <li
                                                        key={d.id}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/70 border border-gray-200 text-xs text-gray-700"
                                                    >
                                                        {d.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            })}
        </div>
    );
}
