// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/ai-automation/auto-accruals/page';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Auto Accruals page', () => {
  it('loads and renders real accrual history from the API (no mock data)', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          accruals: [
            {
              id: 'a1',
              employeeId: 'EMP-1',
              policyId: 'POL-1',
              leaveYear: new Date().getFullYear(),
              accrualMonth: 6,
              accrualDate: '2026-06-01',
              accruedDays: 1.25,
              proRataFactor: 1,
              calculationNote: 'MONTHLY accrual',
            },
          ],
          summary: { totalAccrued: 1.25, totalEmployees: 1, totalRecords: 1 },
        },
      })
    );

    render(<Page />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/leave/accrual');
    expect(init.method).toBe('GET');

    await waitFor(() => expect(screen.getByText('EMP-1')).toBeInTheDocument());
    // Legacy mock names must be gone
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Standard Vacation')).not.toBeInTheDocument();
  });

  it('runs an accrual cycle via POST and shows success feedback', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          data: { accruals: [], summary: { totalAccrued: 0, totalEmployees: 0, totalRecords: 0 } },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            runId: 'r1',
            processDate: '2026-07-01',
            processedCount: 3,
            totalAccrued: 4.5,
            policiesProcessed: 2,
          },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            accruals: [],
            summary: { totalAccrued: 4.5, totalEmployees: 3, totalRecords: 3 },
          },
        })
      );

    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole('button', { name: /run cycle/i }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find((c) => c[1]?.method === 'POST');
      expect(postCall).toBeTruthy();
    });
    const postCall = fetchMock.mock.calls.find((c) => c[1]?.method === 'POST');
    expect(String(postCall![0])).toContain('/leave/accrual');
    const body = JSON.parse(postCall![1].body);
    expect(body.processDate).toBeTruthy();

    await waitFor(() => expect(screen.getByText(/accrual cycle complete/i)).toBeInTheDocument());
  });
});
