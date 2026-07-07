// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/leave/hajj-leave/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Hajj Leave eligibility page', () => {
  it('renders the eligibility form', () => {
    render(<Page />);
    expect(screen.getByText(/hajj leave eligibility/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Years of Service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
  });

  it('POSTs isEligibleForHajjLeave and shows entitled days on success', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ success: true, data: { isEligible: true, days: 30, countryCode: 'AE' } }),
    });

    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('button', { name: /check eligibility/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/compliance/labour-law');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      countryCode: 'AE',
      action: 'isEligibleForHajjLeave',
      params: { isMuslim: true },
    });

    await waitFor(() => expect(screen.getByText(/Eligible for Hajj Leave/i)).toBeInTheDocument());
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('shows an error banner when the API fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Missing parameters' }),
    });

    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('button', { name: /check eligibility/i }));

    await waitFor(() => expect(screen.getByText(/Missing parameters/i)).toBeInTheDocument());
  });
});
