// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/accommodation-compliance/safety-fire/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Accommodation Fire Safety page', () => {
  it('renders title and boolean fields', () => {
    render(<Page />);
    expect(screen.getByText(/accommodation fire safety/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Smoke detectors working/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fire drill in last 6 months/i)).toBeInTheDocument();
  });

  it('submits action=fire payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { pass: true, score: 100, band: 'GOOD', failures: [] } },
        }),
    });
    render(<Page />);
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/accommodation-compliance/safety-controls');
    expect(JSON.parse(init.body)).toMatchObject({ action: 'fire' });
  });

  it('renders fire-safety FAIL verdict on failures', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              pass: false,
              score: 40,
              band: 'CRITICAL',
              failures: [{ code: 'EXIT_BLOCKED', severity: 'CRITICAL' }],
            },
          },
        }),
    });
    render(<Page />);
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/CRITICAL \(40\/100\)/)).toBeInTheDocument());
  });
});
