// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerdictPanel } from '@aura/ui/components/ui';

describe('VerdictPanel', () => {
  it('renders the title and reason', () => {
    render(<VerdictPanel outcome="PASS" title="Eligible" reason="Employee meets all gates" />);
    expect(screen.getByText('Eligible')).toBeInTheDocument();
    expect(screen.getByText('Employee meets all gates')).toBeInTheDocument();
  });

  it('renders the bilingual reason when locale=ar', () => {
    render(
      <VerdictPanel
        outcome="FAIL"
        title="Ineligible"
        titleAr="غير مؤهل"
        reason="Country does not match"
        reasonAr="الدولة لا تطابق"
        locale="ar"
      />
    );
    expect(screen.getByText('غير مؤهل')).toBeInTheDocument();
    expect(screen.getByText('الدولة لا تطابق')).toBeInTheDocument();
  });

  it('falls back to English when Arabic field is omitted', () => {
    render(<VerdictPanel outcome="INFO" title="No data" reason="No catalogue entry" locale="ar" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('shows the outcome pill with the correct bilingual label', () => {
    const { rerender } = render(<VerdictPanel outcome="PASS" title="t" reason="r" />);
    expect(screen.getByText(/Pass/i)).toBeInTheDocument();
    rerender(<VerdictPanel outcome="FAIL" title="t" reason="r" />);
    expect(screen.getByText(/Fail/i)).toBeInTheDocument();
    rerender(<VerdictPanel outcome="WARN" title="t" reason="r" />);
    expect(screen.getByText(/Warning/i)).toBeInTheDocument();
  });

  it('renders the severity pill when supplied', () => {
    render(<VerdictPanel outcome="FAIL" title="Breach" reason="Reason" severity="CRITICAL" />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('renders the breakdown list', () => {
    render(
      <VerdictPanel
        outcome="PASS"
        title="OK"
        reason="ok"
        breakdown={[
          { label: 'Unserved days', value: 12 },
          { label: 'Daily rate', value: '300 AED' },
        ]}
      />
    );
    expect(screen.getByText('Unserved days')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Daily rate')).toBeInTheDocument();
    expect(screen.getByText('300 AED')).toBeInTheDocument();
  });

  it('renders meta pills', () => {
    render(
      <VerdictPanel
        outcome="INFO"
        title="t"
        reason="r"
        meta={[{ label: 'Country', value: 'AE' }]}
      />
    );
    expect(screen.getByText('Country:')).toBeInTheDocument();
    expect(screen.getByText('AE')).toBeInTheDocument();
  });

  it('applies the success container tone for PASS', () => {
    const { container } = render(<VerdictPanel outcome="PASS" title="t" reason="r" />);
    expect(container.firstChild).toHaveClass('bg-emerald-50');
  });

  it('applies the danger container tone for FAIL', () => {
    const { container } = render(<VerdictPanel outcome="FAIL" title="t" reason="r" />);
    expect(container.firstChild).toHaveClass('bg-rose-50');
  });

  it('overrides tone when explicitly supplied', () => {
    const { container } = render(
      <VerdictPanel outcome="PASS" title="t" reason="r" tone="warning" />
    );
    expect(container.firstChild).toHaveClass('bg-amber-50');
  });

  it('exposes role=status for screen readers', () => {
    render(<VerdictPanel outcome="PASS" title="t" reason="r" />);
    const region = screen.getByRole('status');
    expect(region).toBeInTheDocument();
  });
});
