// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/payroll-compliance/period-lock/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Period Lock page', () => {
  it('renders title and key fields', () => {
    render(<Page />);
    expect(screen.getByText(/payroll period lock/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Period \(YYYY-MM\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cut-off date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Change type/i)).toBeInTheDocument();
  });

  it('submits nested period payload on evaluate', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { allow: true, periodStatus: 'OPEN' } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Period \(YYYY-MM\)/i), '2026-05');
    await user.type(screen.getByLabelText(/Cut-off date/i), '2026-05-25');
    await user.selectOptions(screen.getByLabelText(/Change type/i), 'SALARY_CHANGE');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/payroll-compliance/period-lock');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      period: { period: '2026-05', cutOffDate: '2026-05-25' },
      changeType: 'SALARY_CHANGE',
    });
  });

  it('renders FAIL verdict when period locked', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              allow: false,
              reasonEn: 'Period released — no changes permitted',
              periodStatus: 'RELEASED',
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Period \(YYYY-MM\)/i), '2026-04');
    await user.type(screen.getByLabelText(/Cut-off date/i), '2026-04-25');
    await user.selectOptions(screen.getByLabelText(/Change type/i), 'SALARY_CHANGE');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/Change blocked/i)).toBeInTheDocument());
    expect(screen.getByText(/Period released/i)).toBeInTheDocument();
  });
});
