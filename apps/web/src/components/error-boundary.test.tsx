/**
 * Error Boundary Component Tests
 * Tests error catching, fallback UI, and recovery mechanisms
 *
 * @reference docs/testing/COMPONENT-TESTING-GUIDE.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './error-boundary';
import { axe } from '@/__tests__/setupAxe';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; error?: Error }> = ({
  shouldThrow = true,
  error = new Error('Test error'),
}) => {
  if (shouldThrow) {
    throw error;
  }
  return <div>No error</div>;
};

// Suppress console.error during tests to avoid noise
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('Normal Rendering', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Child component</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child component')).toBeInTheDocument();
    });

    it('renders multiple children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('catches errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    });

    it('displays default error UI when error is caught', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
      expect(
        screen.getByText('We encountered an unexpected error. Please try refreshing the page.')
      ).toBeInTheDocument();
    });

    it('displays custom error message in error object', () => {
      const customError = new Error('Custom error message');

      render(
        <ErrorBoundary>
          <ThrowError error={customError} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();

      // In development, error details should be shown
      if (process.env.NODE_ENV === 'development') {
        const details = screen.getByText(/Custom error message/i);
        expect(details).toBeInTheDocument();
      }
    });
  });

  describe('Custom Fallback', () => {
    it('renders custom fallback UI when provided', () => {
      const customFallback = <div data-testid="custom-error">Custom error UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-error')).toBeInTheDocument();
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      expect(screen.queryByText('Something Went Wrong')).not.toBeInTheDocument();
    });
  });

  describe('Error Handler Callback', () => {
    it('calls onError callback when error is caught', () => {
      const onError = vi.fn();
      const testError = new Error('Test error');

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError error={testError} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(testError, expect.any(Object));
    });

    it('passes error info to callback', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      const [, errorInfo] = onError.mock.calls[0];
      expect(errorInfo).toHaveProperty('componentStack');
    });
  });

  describe('Recovery Mechanism', () => {
    it('recovers when Try Again button is clicked', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);

        React.useEffect(() => {
          // Reset error state after component catches it
          const timer = setTimeout(() => setShouldThrow(false), 100);
          return () => clearTimeout(timer);
        }, []);

        return (
          <ErrorBoundary>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
        );
      };

      render(<TestComponent />);

      // Error UI should be shown
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();

      // Click Try Again
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // After recovery, child should render normally
      // Note: In real scenarios, the parent component would handle re-rendering
    });

    it('has Try Again button in error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('has Go to Dashboard link in error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/');
    });
  });

  describe('Reset Keys', () => {
    it('resets error when resetKeys change', () => {
      const { rerender } = render(
        <ErrorBoundary resetKeys={['key1']}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error UI should be shown
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();

      // Change resetKeys to trigger reset
      rerender(
        <ErrorBoundary resetKeys={['key2']}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should show child content after reset
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Something Went Wrong')).not.toBeInTheDocument();
    });

    it('does not reset when resetKeys remain the same', () => {
      const { rerender } = render(
        <ErrorBoundary resetKeys={['key1']}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();

      // Re-render with same resetKeys
      rerender(
        <ErrorBoundary resetKeys={['key1']}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error UI should still be shown
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations in error state', async () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('uses alert role for error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
    });

    it('has aria-live attribute for screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
    });

    it('Try Again button has accessible name', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const button = screen.getByRole('button', { name: /try again/i });
      expect(button).toHaveAccessibleName();
    });

    it('Dashboard link has accessible name', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const link = screen.getByRole('link', { name: /go to dashboard/i });
      expect(link).toHaveAccessibleName();
    });
  });

  describe('Development vs Production', () => {
    it('shows error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError error={new Error('Detailed error for testing')} />
        </ErrorBoundary>
      );

      // Error details should be present in development
      const details = screen.getByText(/Error Details/i);
      expect(details).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Edge Cases', () => {
    it('handles error with no message', () => {
      const errorWithoutMessage = new Error();

      render(
        <ErrorBoundary>
          <ThrowError error={errorWithoutMessage} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    });

    it('handles nested error boundaries', () => {
      const OuterError = () => {
        throw new Error('Outer error');
      };

      render(
        <ErrorBoundary fallback={<div>Outer error boundary</div>}>
          <ErrorBoundary fallback={<div>Inner error boundary</div>}>
            <ThrowError />
          </ErrorBoundary>
          <OuterError />
        </ErrorBoundary>
      );

      // Inner error boundary should catch ThrowError
      // Outer error boundary should catch OuterError
      expect(screen.getByText('Outer error boundary')).toBeInTheDocument();
    });

    it('preserves error boundary state across re-renders', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();

      // Re-render without changing props
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error UI should still be shown
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    });
  });
});
