/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays fallback UI
 *
 * @reference https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

'use client';

import type { ErrorInfo, ReactNode } from 'react';
import React, { Component } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary to catch React errors in component tree
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Store error info in state
    this.setState({
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      !this.areResetKeysEqual(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset();
    }
  }

  areResetKeysEqual(
    prevKeys: Array<string | number> | undefined,
    currentKeys: Array<string | number> | undefined
  ): boolean {
    if (!prevKeys || !currentKeys) return prevKeys === currentKeys;
    if (prevKeys.length !== currentKeys.length) return false;
    return prevKeys.every((key, index) => key === currentKeys[index]);
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[400px] px-4 py-12"
          role="alert"
          aria-live="assertive"
        >
          <div className="relative z-10 flex flex-col items-center text-center max-w-md">
            {/* Icon */}
            <div className="mb-6 p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-16 h-16" />
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-black dark:text-pearl mb-3">
              Something Went Wrong
            </h1>

            {/* Description */}
            <p className="text-twilight dark:text-silver-mist mb-2 leading-relaxed">
              We encountered an unexpected error. Please try refreshing the page.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-8 w-full text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                <summary className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 cursor-pointer">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-red-800 dark:text-red-300 overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={this.reset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-celestial-indigo to-quantum-rose hover:opacity-90 transition-opacity"
                aria-label="Try again"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-twilight dark:text-silver-mist bg-pearl dark:bg-stellar-blue hover:bg-cloud dark:hover:bg-nebula-purple transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
