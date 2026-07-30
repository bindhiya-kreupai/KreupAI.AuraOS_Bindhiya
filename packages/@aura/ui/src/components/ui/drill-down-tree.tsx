'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * EPIC-31 country/entity drill-down tree.
 *
 * Renders the recursive Global → Country → Entity → Department tree
 * produced by `executive-compliance/drill-down.service.aggregateFlagsByCountryEntity`.
 *
 * Each node shows:
 *  - flag count
 *  - max severity (colored pill)
 *  - 0..100 risk score (colored pill)
 *  - top 5 flags (expandable section per node)
 *
 * Click handler exposes the clicked node so the host page can route
 * to a filtered list.
 */

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DrillNode {
    key: string;
    label: string;
    level: 'GLOBAL' | 'COUNTRY' | 'ENTITY' | 'DEPARTMENT' | 'COST_CENTER';
    flagCount: number;
    severityCounts: Record<Severity, number>;
    maxSeverity: Severity | null;
    riskScore: number;
    topFive: Array<{
        id: string;
        label?: string;
        severity: Severity;
        raisedAt: Date | string;
    }>;
    children?: DrillNode[];
}

export interface DrillDownTreeProps {
    root: DrillNode;
    onNodeClick?: (node: DrillNode) => void;
    /** Levels to expand by default (default: GLOBAL + COUNTRY). */
    defaultExpanded?: DrillNode['level'][];
    locale?: 'en' | 'ar';
    className?: string;
}

const SEVERITY_TONE: Record<Severity, string> = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-300',
    LOW: 'bg-sky-100 text-sky-800 border-sky-300',
};

function scoreTone(score: number): string {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    if (score >= 30) return 'bg-amber-100 text-amber-800';
    if (score > 0) return 'bg-sky-100 text-sky-800';
    return 'bg-gray-100 text-gray-500';
}

const LEVEL_LABEL: Record<DrillNode['level'], { en: string; ar: string }> = {
    GLOBAL: { en: 'Global', ar: 'عالمي' },
    COUNTRY: { en: 'Country', ar: 'دولة' },
    ENTITY: { en: 'Entity', ar: 'كيان' },
    DEPARTMENT: { en: 'Department', ar: 'إدارة' },
    COST_CENTER: { en: 'Cost centre', ar: 'مركز تكلفة' },
};

interface NodeRowProps {
    node: DrillNode;
    depth: number;
    defaultExpanded: DrillNode['level'][];
    onNodeClick?: (node: DrillNode) => void;
    locale: 'en' | 'ar';
}

function NodeRow({ node, depth, defaultExpanded, onNodeClick, locale }: NodeRowProps) {
    const [expanded, setExpanded] = useState(defaultExpanded.includes(node.level));
    const hasChildren = (node.children?.length ?? 0) > 0;
    const indent = depth * 16;

    return (
        <li>
            <div
                className="flex items-center gap-2 py-1.5 hover:bg-gray-50 rounded-md px-2"
                style={{ paddingInlineStart: indent + 8 }}
            >
                {hasChildren ? (
                    <button
                        type="button"
                        onClick={() => setExpanded((s) => !s)}
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        {expanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                ) : (
                    <span className="w-4 h-4 inline-block" aria-hidden />
                )}
                <button
                    type="button"
                    onClick={() => onNodeClick?.(node)}
                    className="flex-1 text-left flex items-center gap-3 text-sm font-medium text-gray-800 hover:text-blue-700"
                >
                    <span className="text-xs uppercase tracking-wide text-gray-400 w-20">
                        {LEVEL_LABEL[node.level][locale]}
                    </span>
                    <span>{node.label}</span>
                </button>
                <span
                    className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                        scoreTone(node.riskScore),
                    )}
                    title="Risk score 0–100"
                >
                    {node.riskScore}
                </span>
                {node.maxSeverity && (
                    <span
                        className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold',
                            SEVERITY_TONE[node.maxSeverity],
                        )}
                    >
                        {node.maxSeverity}
                    </span>
                )}
                <span className="inline-flex items-center text-xs text-gray-500 min-w-[3rem] justify-end">
                    {node.flagCount} {locale === 'ar' ? 'علم' : 'flags'}
                </span>
            </div>
            {expanded && hasChildren && (
                <ul className="border-l border-dashed border-gray-200 ml-4">
                    {node.children!.map((child) => (
                        <NodeRow
                            key={child.key}
                            node={child}
                            depth={depth + 1}
                            defaultExpanded={defaultExpanded}
                            onNodeClick={onNodeClick}
                            locale={locale}
                        />
                    ))}
                </ul>
            )}
            {expanded && !hasChildren && node.topFive.length > 0 && (
                <ul className="ml-12 mt-1 mb-2 text-xs text-gray-600 space-y-0.5">
                    {node.topFive.map((f) => (
                        <li key={f.id} className="flex items-center gap-2">
                            <span
                                className={cn(
                                    'inline-block w-2 h-2 rounded-full',
                                    f.severity === 'CRITICAL'
                                        ? 'bg-red-500'
                                        : f.severity === 'HIGH'
                                          ? 'bg-orange-500'
                                          : f.severity === 'MEDIUM'
                                            ? 'bg-amber-500'
                                            : 'bg-sky-500',
                                )}
                                aria-hidden
                            />
                            <span className="truncate">{f.label ?? f.id}</span>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}

export function DrillDownTree({
    root,
    onNodeClick,
    defaultExpanded = ['GLOBAL', 'COUNTRY'],
    locale = 'en',
    className,
}: DrillDownTreeProps) {
    return (
        <div className={cn('text-sm', className)} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <ul className="space-y-0.5">
                <NodeRow
                    node={root}
                    depth={0}
                    defaultExpanded={defaultExpanded}
                    onNodeClick={onNodeClick}
                    locale={locale}
                />
            </ul>
        </div>
    );
}
