// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock the analytics API the hub calls on mount so we can assert live KPIs.
const getAnalytics = vi.fn();
vi.mock('../../app/dashboard/hr-helpdesk/services', () => ({
  HelpdeskAnalyticsApi: { get: () => getAnalytics() },
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import HrsdPage from '../../app/dashboard/hr-helpdesk/page';

describe('HR Service Desk hub page', () => {
  beforeEach(() => {
    getAnalytics.mockReset();
  });

  it('renders live KPIs from the analytics API and computes resolution rate', async () => {
    getAnalytics.mockResolvedValue({
      windowDays: 30,
      total: 20,
      open: 5,
      resolved: 10,
      byCategory: [],
      byPriority: [],
      generatedAt: new Date().toISOString(),
    });

    render(<HrsdPage />);

    await waitFor(() => expect(screen.getByText('20')).toBeInTheDocument());
    // resolved 10 / total 20 => 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
    // navigation links to child routes are present
    expect(screen.getByText('Tickets')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
  });

  it('shows an error banner when the analytics call fails', async () => {
    getAnalytics.mockRejectedValue(new Error('boom'));

    render(<HrsdPage />);

    await waitFor(() =>
      expect(screen.getByText(/Failed to load helpdesk summary/i)).toBeInTheDocument()
    );
  });
});
