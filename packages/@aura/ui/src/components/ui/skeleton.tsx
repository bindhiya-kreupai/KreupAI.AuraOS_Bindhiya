import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Loading skeleton primitive.
 *
 * Renders a shimmering placeholder block. Used in place of the
 * plain "Loading…" text in EvaluatorPage + future dashboard pages
 * so the user sees the page shape immediately while the network
 * request is in flight.
 *
 * Three preset variants are exposed via the `<Skeleton>` component
 * itself; richer compositions can wrap multiple skeletons or build
 * the layout via the `<SkeletonGroup>` helper.
 */

export type SkeletonVariant =
    | 'text'
    | 'title'
    | 'card'
    | 'avatar'
    | 'table-row'
    | 'pill'
    | 'block';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: SkeletonVariant;
    /** Tailwind width class, e.g. 'w-32'. */
    widthClass?: string;
    /** Tailwind height class, e.g. 'h-4'. */
    heightClass?: string;
    /** Number of repeated rows for table-row / text. */
    rows?: number;
    /** Optional aria-label. */
    label?: string;
}

const VARIANT_SHAPE: Record<SkeletonVariant, string> = {
    text: 'h-3 rounded',
    title: 'h-5 rounded',
    card: 'h-32 rounded-md',
    avatar: 'w-10 h-10 rounded-full',
    'table-row': 'h-8 rounded',
    pill: 'h-5 w-16 rounded-full',
    block: 'h-12 rounded-md',
};

function shimmerClass() {
    // Tailwind utility chain that produces a left-to-right shimmer via a
    // moving gradient mask. Subtle, non-distracting.
    return 'animate-pulse bg-gray-200/80';
}

export function Skeleton({
    variant = 'text',
    widthClass,
    heightClass,
    rows = 1,
    label,
    className,
    ...rest
}: SkeletonProps) {
    if (rows > 1) {
        return (
            <div className="space-y-2" aria-label={label ?? 'Loading'} role="status">
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            shimmerClass(),
                            VARIANT_SHAPE[variant],
                            widthClass ?? (i === rows - 1 ? 'w-3/4' : 'w-full'),
                            heightClass,
                            className,
                        )}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            role="status"
            aria-label={label ?? 'Loading'}
            className={cn(
                shimmerClass(),
                VARIANT_SHAPE[variant],
                widthClass ?? 'w-full',
                heightClass,
                className,
            )}
            {...rest}
        />
    );
}

/**
 * Convenience composition: renders a typical "form is loading" block —
 * one title skeleton + N text rows + a button skeleton. Used by
 * EvaluatorPage's initial load state.
 */
export interface SkeletonFormProps {
    rows?: number;
    /** Show a final button-shaped skeleton at the bottom. */
    showSubmit?: boolean;
    className?: string;
}

export function SkeletonForm({ rows = 4, showSubmit = true, className }: SkeletonFormProps) {
    return (
        <div
            className={cn('space-y-4 rounded-md border border-gray-200 bg-white p-4', className)}
            role="status"
            aria-label="Form loading"
        >
            <Skeleton variant="title" widthClass="w-1/3" />
            <Skeleton variant="text" rows={rows} />
            {showSubmit && (
                <div className="flex justify-start">
                    <Skeleton variant="block" widthClass="w-32" heightClass="h-9" />
                </div>
            )}
        </div>
    );
}

/**
 * Convenience composition: renders a "verdict is loading" block —
 * a card-sized skeleton with an internal title + 2 lines. Used by
 * EvaluatorPage while the API response is pending.
 */
export function SkeletonVerdict({ className }: { className?: string }) {
    return (
        <div
            className={cn('rounded-md border border-gray-200 bg-white p-4 space-y-3', className)}
            role="status"
            aria-label="Verdict loading"
        >
            <div className="flex items-center gap-2">
                <Skeleton variant="avatar" widthClass="w-6" heightClass="h-6" />
                <Skeleton variant="title" widthClass="w-1/2" />
                <Skeleton variant="pill" />
            </div>
            <Skeleton variant="text" rows={2} />
        </div>
    );
}
