// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@aura/ui/components/ui/status-badge';

describe('StatusBadge', () => {
  beforeEach(() => {
    document.documentElement.lang = 'en';
  });

  it('renders the English label by default', () => {
    render(<StatusBadge labelEn="Active" labelAr="نشط" tone="success" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByText('نشط')).not.toBeInTheDocument();
  });

  it('renders the Arabic label when locale="ar" and applies dir="rtl"', () => {
    const { container } = render(
      <StatusBadge labelEn="Active" labelAr="نشط" locale="ar" tone="success" />
    );
    expect(screen.getByText('نشط')).toBeInTheDocument();
    expect(container.querySelector('[dir="rtl"]')).not.toBeNull();
  });

  it('falls back to English when Arabic label is missing even if locale="ar"', () => {
    const { container } = render(<StatusBadge labelEn="Open" locale="ar" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
    // no Arabic to render → no RTL direction applied
    expect(container.querySelector('[dir="rtl"]')).toBeNull();
  });

  it('resolves locale from document.documentElement.lang when prop omitted', () => {
    document.documentElement.lang = 'ar-SA';
    render(<StatusBadge labelEn="Pending" labelAr="قيد الانتظار" tone="pending" />);
    expect(screen.getByText('قيد الانتظار')).toBeInTheDocument();
  });

  it('shows a tone-coloured dot when dot={true}', () => {
    const { container } = render(<StatusBadge labelEn="Error" tone="danger" dot />);
    // dot is the only child span with rounded-full + bg-rose-500
    expect(container.querySelector('.bg-rose-500')).not.toBeNull();
  });

  it('applies the success tone classes', () => {
    const { container } = render(<StatusBadge labelEn="OK" tone="success" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.className).toContain('text-emerald-700');
  });
});
