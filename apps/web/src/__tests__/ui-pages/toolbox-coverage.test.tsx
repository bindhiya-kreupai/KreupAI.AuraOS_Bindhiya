// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/hse-compliance/toolbox-coverage/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Toolbox Coverage page', () => {
  it('renders title and JSON inputs', () => {
    render(<Page />);
    expect(screen.getByText(/toolbox-talk coverage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employees/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Attendances/i)).toBeInTheDocument();
  });

  it('submits action=toolbox payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: { totals: { employeesInScope: 1, overdue: 0, coveragePct: 100 } },
          },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Employees/i), {
      target: { value: '[{"employeeId":"E1"}]' },
    });
    fireEvent.change(screen.getByLabelText(/Attendances/i), {
      target: { value: '[{"employeeId":"E1","attendedAt":"2026-06-10"}]' },
    });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/hse-compliance/safety-management');
    const body = JSON.parse(init.body);
    expect(body.action).toBe('toolbox');
  });

  it('renders the toolbox coverage verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: { totals: { employeesInScope: 1, overdue: 0, coveragePct: 100 } },
          },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Employees/i), { target: { value: '[]' } });
    fireEvent.change(screen.getByLabelText(/Attendances/i), { target: { value: '[]' } });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/100% coverage/)).toBeInTheDocument());
  });
});
