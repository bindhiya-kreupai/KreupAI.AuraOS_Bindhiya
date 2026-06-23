// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '@aura/ui/components/ui';

describe('ErrorState', () => {
  it('renders the title', () => {
    render(<ErrorState title="Network error" />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders the message when supplied', () => {
    render(<ErrorState title="X" message="Could not reach the API" />);
    expect(screen.getByText('Could not reach the API')).toBeInTheDocument();
  });

  it('exposes role=alert for screen readers', () => {
    render(<ErrorState title="X" message="m" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the Arabic title + message when locale=ar', () => {
    render(
      <ErrorState
        title="Network error"
        titleAr="خطأ في الشبكة"
        message="EN"
        messageAr="ع"
        locale="ar"
      />
    );
    expect(screen.getByText('خطأ في الشبكة')).toBeInTheDocument();
    expect(screen.getByText('ع')).toBeInTheDocument();
  });

  it('falls back to English when Arabic field is omitted', () => {
    render(<ErrorState title="EN only" locale="ar" />);
    expect(screen.getByText('EN only')).toBeInTheDocument();
  });

  it('applies the danger container tone by default', () => {
    const { container } = render(<ErrorState title="X" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-rose-50');
  });

  it('applies the warning container tone when tone=warning', () => {
    const { container } = render(<ErrorState title="X" tone="warning" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-amber-50');
  });

  it('renders the validation-details disclosure when issues supplied', () => {
    render(
      <ErrorState
        title="Invalid input"
        issues={{
          formErrors: ['Missing required field'],
          fieldErrors: { employeeId: ['must be a uuid'] },
        }}
      />
    );
    // <summary> renders the visible label
    expect(screen.getByText(/Validation details/i)).toBeInTheDocument();
    expect(screen.getByText(/Missing required field/i)).toBeInTheDocument();
    expect(screen.getByText('employeeId:')).toBeInTheDocument();
  });

  it('does NOT render the disclosure when issues is null', () => {
    render(<ErrorState title="X" />);
    expect(screen.queryByText(/Validation details/i)).toBeNull();
  });

  it('does NOT render the disclosure when issues is empty', () => {
    render(<ErrorState title="X" issues={{ formErrors: [], fieldErrors: {} }} />);
    expect(screen.queryByText(/Validation details/i)).toBeNull();
  });

  it('renders a retry button when onRetry is supplied', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState title="X" onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders the Arabic retry label when locale=ar', () => {
    render(<ErrorState title="X" onRetry={() => undefined} locale="ar" />);
    expect(screen.getByRole('button', { name: /إعادة المحاولة/ })).toBeInTheDocument();
  });
});
