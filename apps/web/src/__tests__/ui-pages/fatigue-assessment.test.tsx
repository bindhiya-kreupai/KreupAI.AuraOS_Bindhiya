// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/overtime-compliance/fatigue-assessment/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Fatigue Assessment page', () => {
  it('renders title and measured fields', () => {
    render(<Page />);
    expect(screen.getByText(/fatigue assessment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hours worked/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Consecutive days/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rest hours/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Proposed shift/i)).toBeInTheDocument();
  });

  it('submits measured payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { allow: true, band: 'SAFE', warnings: [] } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.type(screen.getByLabelText(/Hours worked/i), '40');
    await user.type(screen.getByLabelText(/Consecutive days/i), '4');
    await user.type(screen.getByLabelText(/Rest hours/i), '12');
    await user.type(screen.getByLabelText(/Proposed shift/i), '8');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/overtime-compliance/fatigue-assessment');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      employeeId: 'E1',
      measured: {
        hoursLast7Days: 40,
        consecutiveDays: 4,
        restHoursSinceLastShift: 12,
        proposedHours: 8,
      },
    });
  });

  it('renders CRITICAL verdict band on failed assessment', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              allow: false,
              band: 'CRITICAL',
              reasonEn: '60h exceeds 7-day cap',
              measured: {
                hoursLast7Days: 60,
                consecutiveDays: 7,
                restHoursSinceLastShift: 6,
                proposedHours: 10,
              },
              riskScore: 92,
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.type(screen.getByLabelText(/Hours worked/i), '60');
    await user.type(screen.getByLabelText(/Consecutive days/i), '7');
    await user.type(screen.getByLabelText(/Rest hours/i), '6');
    await user.type(screen.getByLabelText(/Proposed shift/i), '10');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/60h exceeds 7-day cap/)).toBeInTheDocument());
    expect(screen.getAllByText(/CRITICAL/).length).toBeGreaterThan(0);
  });
});
