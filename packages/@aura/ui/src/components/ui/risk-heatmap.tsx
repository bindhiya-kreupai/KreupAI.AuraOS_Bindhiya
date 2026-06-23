import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * 2D risk heatmap (EPIC-31).
 *
 * Pivots a flat list of (domain, country, riskScore) cells into a 2D
 * grid where rows = domains, columns = countries, cells are colored
 * by 0..100 risk band:
 *   0..29   cool (sky)
 *   30..59  warm (amber)
 *   60..79  hot (orange)
 *   80..100 critical (red)
 *
 * Empty (domain, country) intersections are rendered as light gray so
 * the grid stays legible even on sparse data.
 *
 * Click handler exposes (domain, country, riskScore) so the host page
 * can drill into per-cell details.
 */

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskHeatmapCell {
    domain: string;
    country: string;
    flagCount: number;
    riskScore: number;
    maxSeverity: RiskSeverity | null;
}

export interface RiskHeatmapProps {
    cells: RiskHeatmapCell[];
    /** Optional explicit row order — defaults to insertion order of domains in cells. */
    domainOrder?: string[];
    /** Optional explicit column order — defaults to insertion order of countries in cells. */
    countryOrder?: string[];
    /** Click handler for a cell. */
    onCellClick?: (cell: RiskHeatmapCell) => void;
    /** Compact mode renders smaller cells (suited for embedded dashboards). */
    compact?: boolean;
    /** Optional caption rendered above the grid. */
    caption?: string;
    /** Locale — toggles the empty-state copy. */
    locale?: 'en' | 'ar';
    className?: string;
}

function bandColor(score: number): string {
    if (score >= 80) return 'bg-red-600 text-white';
    if (score >= 60) return 'bg-orange-500 text-white';
    if (score >= 30) return 'bg-amber-400 text-amber-950';
    if (score > 0) return 'bg-sky-200 text-sky-900';
    return 'bg-gray-100 text-gray-400';
}

function uniquePreservingOrder(values: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of values) {
        if (!seen.has(v)) {
            seen.add(v);
            out.push(v);
        }
    }
    return out;
}

const EMPTY_TEXT: Record<'en' | 'ar', string> = {
    en: 'No open risks to display',
    ar: 'لا توجد مخاطر مفتوحة للعرض',
};

export function RiskHeatmap({
    cells,
    domainOrder,
    countryOrder,
    onCellClick,
    compact,
    caption,
    locale = 'en',
    className,
}: RiskHeatmapProps) {
    const domains =
        domainOrder ?? uniquePreservingOrder(cells.map((c) => c.domain));
    const countries =
        countryOrder ?? uniquePreservingOrder(cells.map((c) => c.country));

    const cellByKey = new Map<string, RiskHeatmapCell>();
    for (const c of cells) cellByKey.set(`${c.domain}::${c.country}`, c);

    if (domains.length === 0 || countries.length === 0) {
        return (
            <div
                className={cn(
                    'rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500',
                    className,
                )}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
                {EMPTY_TEXT[locale]}
            </div>
        );
    }

    const cellSize = compact ? 'w-10 h-10 text-xs' : 'w-16 h-16 text-sm';

    return (
        <div className={cn('inline-block', className)} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {caption && (
                <div className="mb-2 text-sm font-medium text-gray-800">{caption}</div>
            )}
            <table className="border-separate border-spacing-0.5">
                <thead>
                    <tr>
                        <th className={cn('p-2 text-left text-xs font-semibold text-gray-500', compact && 'p-1')}>
                            {/* Top-left corner */}
                        </th>
                        {countries.map((country) => (
                            <th
                                key={country}
                                className={cn(
                                    'p-2 text-xs font-semibold text-gray-700',
                                    compact && 'p-1',
                                )}
                                title={country}
                                scope="col"
                            >
                                {country}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {domains.map((domain) => (
                        <tr key={domain}>
                            <th
                                scope="row"
                                className={cn(
                                    'p-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap',
                                    compact && 'p-1',
                                )}
                                title={domain}
                            >
                                {domain}
                            </th>
                            {countries.map((country) => {
                                const c = cellByKey.get(`${domain}::${country}`);
                                const score = c?.riskScore ?? 0;
                                const tone = bandColor(score);
                                const label = c ? `${score}` : '—';
                                return (
                                    <td key={country} className="p-0">
                                        <button
                                            type="button"
                                            onClick={c ? () => onCellClick?.(c) : undefined}
                                            disabled={!c}
                                            aria-label={
                                                c
                                                    ? `${domain} ${country} risk score ${score}, ${c.flagCount} flags, severity ${c.maxSeverity ?? 'NONE'}`
                                                    : `${domain} ${country} no flags`
                                            }
                                            title={
                                                c
                                                    ? `${domain} × ${country}\nScore: ${score}\nFlags: ${c.flagCount}\nMax severity: ${c.maxSeverity ?? 'NONE'}`
                                                    : `${domain} × ${country} — no flags`
                                            }
                                            className={cn(
                                                'rounded-md inline-flex items-center justify-center font-semibold transition-shadow hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-default disabled:hover:ring-0',
                                                cellSize,
                                                tone,
                                            )}
                                        >
                                            {label}
                                        </button>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-gray-100" /> 0
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-sky-200" /> 1–29
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-400" /> 30–59
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-orange-500" /> 60–79
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-red-600" /> 80+
                </span>
            </div>
        </div>
    );
}
