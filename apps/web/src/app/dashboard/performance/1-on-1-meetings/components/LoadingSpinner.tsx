/**
 * Loading Spinner Component
 * Shows loading state for async operations
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    fullScreen?: boolean;
}

const SIZES = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    fullScreen = false,
}) => {
    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={`${SIZES[size]} animate-spin text-emerald-600`} />
            {message && (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => {
    return (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
            <LoadingSpinner size="lg" message={message} />
        </div>
    );
};

