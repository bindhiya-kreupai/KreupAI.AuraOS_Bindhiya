// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/hse-compliance/drill-cadence/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Drill Cadence page', () => {
  it('renders title and drills field', () => {
    render(<Page />);
    expect(screen.getByText(/emergency-drill cadence/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Drills/i)).toBeInTheDocument();
  });

  it('submits action=drill payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: { totals: { drillTypesInScope: 4, overdue: 0, coveragePct: 100 } },
          },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Drills/i), {
      target: {
        value: '[{"drillType":"FIRE","conductedAt":"2026-03-01","attendancePct":92,"passed":true}]',
      },
    });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/hse-compliance/safety-management');
    const body = JSON.parse(init.body);
    expect(body.action).toBe('drill');
    expect(body.input.drills).toHaveLength(1);
  });

  it('renders the drill coverage verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: { totals: { drillTypesInScope: 4, overdue: 0, coveragePct: 100 } },
          },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Drills/i), { target: { value: '[]' } });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/100% drill coverage/)).toBeInTheDocument());
  });
});
