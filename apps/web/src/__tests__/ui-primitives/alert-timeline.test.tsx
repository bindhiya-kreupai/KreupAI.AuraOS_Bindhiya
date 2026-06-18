// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertTimeline, type AlertTimelineItem } from '@aura/ui/components/ui';

function item(
  overrides: Partial<AlertTimelineItem> & {
    id: string;
    severity: AlertTimelineItem['severity'];
    code: string;
    message: string;
  }
): AlertTimelineItem {
  return { ...overrides } as AlertTimelineItem;
}

describe('AlertTimeline', () => {
  it('renders the empty state when no items', () => {
    render(<AlertTimeline items={[]} />);
    expect(screen.getByText(/no alerts/i)).toBeInTheDocument();
  });

  it('renders Arabic empty state when locale=ar', () => {
    render(<AlertTimeline items={[]} locale="ar" />);
    expect(screen.getByText(/تنبيهات/)).toBeInTheDocument();
  });

  it('groups items by severity band', () => {
    render(
      <AlertTimeline
        items={[
          item({
            id: 'a',
            severity: 'CRITICAL',
            code: 'T-1',
            message: 'Visa expires tomorrow',
            daysFromNow: 1,
          }),
          item({
            id: 'b',
            severity: 'INFO',
            code: 'T-60',
            message: 'Initiate renewal',
            daysFromNow: 60,
          }),
        ]}
      />
    );
    expect(screen.getByText(/Critical/i)).toBeInTheDocument();
    expect(screen.getByText(/Info/i)).toBeInTheDocument();
  });

  it('orders sections CRITICAL → OVERDUE → URGENT → WARNING → INFO by default', () => {
    const { container } = render(
      <AlertTimeline
        items={[
          item({ id: 'a', severity: 'INFO', code: 'T-60', message: 'A' }),
          item({ id: 'b', severity: 'CRITICAL', code: 'T-1', message: 'B' }),
          item({ id: 'c', severity: 'URGENT', code: 'T-7', message: 'C' }),
        ]}
      />
    );
    const sections = container.querySelectorAll('section');
    // Critical section comes first
    expect(sections[0].textContent).toMatch(/Critical/i);
    // Info comes last among present
    expect(sections[sections.length - 1].textContent).toMatch(/Info/i);
  });

  it('shows a count badge per section by default', () => {
    render(
      <AlertTimeline
        items={[
          item({ id: 'a', severity: 'CRITICAL', code: 'T-1', message: 'A' }),
          item({ id: 'b', severity: 'CRITICAL', code: 'T-1', message: 'B' }),
        ]}
      />
    );
    // 2 critical items → count badge "2"
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('hides count badges when hideCounts=true', () => {
    render(
      <AlertTimeline
        hideCounts
        items={[item({ id: 'a', severity: 'CRITICAL', code: 'T-1', message: 'A' })]}
      />
    );
    // Critical section should NOT have a "1" pill
    expect(screen.queryByText(/^1$/)).toBeNull();
  });

  it('renders the bilingual message (English by default)', () => {
    render(
      <AlertTimeline
        items={[
          item({
            id: 'a',
            severity: 'WARNING',
            code: 'T-30',
            message: 'Confirm vendor',
            messageAr: 'تأكيد المورد',
          }),
        ]}
      />
    );
    expect(screen.getByText('Confirm vendor')).toBeInTheDocument();
  });

  it('renders the Arabic message when locale=ar', () => {
    render(
      <AlertTimeline
        locale="ar"
        items={[
          item({
            id: 'a',
            severity: 'WARNING',
            code: 'T-30',
            message: 'Confirm vendor',
            messageAr: 'تأكيد المورد',
          }),
        ]}
      />
    );
    expect(screen.getByText('تأكيد المورد')).toBeInTheDocument();
  });

  it('falls back to English message when messageAr is missing in ar locale', () => {
    render(
      <AlertTimeline
        locale="ar"
        items={[item({ id: 'a', severity: 'INFO', code: 'T-60', message: 'EN only' })]}
      />
    );
    expect(screen.getByText('EN only')).toBeInTheDocument();
  });

  it('renders daysFromNow as "in 7d" / "7d ago" / "today"', () => {
    render(
      <AlertTimeline
        items={[
          item({ id: 'a', severity: 'URGENT', code: 'T-7', message: 'A', daysFromNow: 7 }),
          item({ id: 'b', severity: 'OVERDUE', code: 'T+3', message: 'B', daysFromNow: -3 }),
          item({ id: 'c', severity: 'CRITICAL', code: 'T-0', message: 'C', daysFromNow: 0 }),
        ]}
      />
    );
    expect(screen.getByText(/in 7d/i)).toBeInTheDocument();
    expect(screen.getByText(/3d ago/i)).toBeInTheDocument();
    expect(screen.getByText(/today/i)).toBeInTheDocument();
  });

  it('renders dependents as pills under the item', () => {
    render(
      <AlertTimeline
        items={[
          item({
            id: 'a',
            severity: 'URGENT',
            code: 'T-15',
            message: 'Visa expires',
            dependents: [
              { id: 'd1', label: 'Spouse visa' },
              { id: 'd2', label: 'Child visa' },
            ],
          }),
        ]}
      />
    );
    expect(screen.getByText('Spouse visa')).toBeInTheDocument();
    expect(screen.getByText('Child visa')).toBeInTheDocument();
  });

  it('invokes onClick when an item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AlertTimeline
        items={[item({ id: 'a', severity: 'URGENT', code: 'T-7', message: 'Click me', onClick })]}
      />
    );
    await user.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });

  it('disables the button when onClick is omitted', () => {
    render(
      <AlertTimeline
        items={[item({ id: 'a', severity: 'INFO', code: 'T-60', message: 'No click' })]}
      />
    );
    const button = screen.getByText('No click').closest('button');
    expect(button).toBeDisabled();
  });
});
