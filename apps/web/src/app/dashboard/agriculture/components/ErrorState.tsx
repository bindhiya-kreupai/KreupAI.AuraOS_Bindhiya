import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30 text-center">
      <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
      <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300 mb-1">{title}</h3>
      <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-lg font-semibold border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
};
