// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/holidays-compliance/leave-overlap/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Holiday Leave Overlap page', () => {
  it('renders title and key fields', () => {
    render(<Page />);
    expect(screen.getByText(/holiday \+ leave overlap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Leave start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Leave end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Holidays/i)).toBeInTheDocument();
  });

  it('submits payload to the leave-overlap endpoint', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            result: {
              adjustedLeaveDays: 4,
              holidayDays: 1,
              provisionalDays: 0,
              requiresRerunOnConfirmation: false,
            },
            totalDays: 5,
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Leave start date/i), '2026-06-01');
    await user.type(screen.getByLabelText(/Leave end date/i), '2026-06-05');
    // fireEvent.change avoids userEvent interpretation of [ / { as key descriptors.
    fireEvent.change(screen.getByLabelText(/Holidays/i), {
      target: {
        value: '[{"date":"2026-06-05","label":"Eid","holidayClass":"PUBLIC","state":"CONFIRMED"}]',
      },
    });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/holidays-compliance/leave-overlap');
    const body = JSON.parse(init.body);
    expect(body.leave.startDate).toBe('2026-06-01');
    expect(body.holidays).toHaveLength(1);
  });

  it('renders adjusted leave days verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            result: {
              adjustedLeaveDays: 4,
              holidayDays: 1,
              provisionalDays: 0,
              requiresRerunOnConfirmation: false,
            },
            totalDays: 5,
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Leave start date/i), '2026-06-01');
    await user.type(screen.getByLabelText(/Leave end date/i), '2026-06-05');
    fireEvent.change(screen.getByLabelText(/Holidays/i), { target: { value: '[]' } });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/4 day\(s\) deducted/)).toBeInTheDocument());
  });
});
