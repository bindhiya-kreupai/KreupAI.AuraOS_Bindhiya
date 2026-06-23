// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/onboarding/checklist/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Onboarding Checklist page', () => {
  it('renders title and joining date field', () => {
    render(<Page />);
    expect(screen.getAllByText(/onboarding checklist/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Joining date/i)).toBeInTheDocument();
  });

  it('submits joiningDate to the checklist endpoint', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              items: [],
              summary: {
                total: 1,
                done: 0,
                pending: 1,
                overdue: 0,
                blockersDone: 0,
                blockersTotal: 1,
                pctComplete: 0,
                pctBlockersComplete: 0,
                canJoin: false,
                byStage: {
                  PRE_JOINING: { done: 0, total: 1 },
                  JOINING_DAY: { done: 0, total: 0 },
                },
              },
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Joining date/i), '2026-07-01');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/onboarding/checklist');
    expect(JSON.parse(init.body)).toMatchObject({ joiningDate: '2026-07-01' });
  });

  it('renders FAIL verdict when blockers outstanding', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              items: [],
              summary: {
                total: 1,
                done: 0,
                pending: 1,
                overdue: 0,
                blockersDone: 0,
                blockersTotal: 1,
                pctComplete: 0,
                pctBlockersComplete: 0,
                canJoin: false,
                byStage: {
                  PRE_JOINING: { done: 0, total: 1 },
                  JOINING_DAY: { done: 0, total: 0 },
                },
              },
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Joining date/i), '2026-07-01');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getAllByText(/blockers/i).length).toBeGreaterThan(0));
  });
});
