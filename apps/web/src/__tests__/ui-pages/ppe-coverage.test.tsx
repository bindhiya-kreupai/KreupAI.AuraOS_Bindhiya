// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/hse-compliance/ppe-coverage/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('PPE Coverage page', () => {
  it('renders title and required JSON fields', () => {
    render(<Page />);
    expect(screen.getByText(/PPE coverage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employees/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Requirements/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Issuances/i)).toBeInTheDocument();
  });

  it('submits action=ppe payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              totals: {
                employeesInScope: 1,
                requirementsChecked: 1,
                failures: 0,
                coveragePct: 100,
              },
            },
          },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Employees/i), {
      target: { value: '[{"employeeId":"E1","role":"DRIVER"}]' },
    });
    fireEvent.change(screen.getByLabelText(/Requirements/i), {
      target: { value: '[{"role":"DRIVER","ppeType":"HI_VIS"}]' },
    });
    fireEvent.change(screen.getByLabelText(/Issuances/i), {
      target: {
        value:
          '[{"employeeId":"E1","ppeType":"HI_VIS","issuedAt":"2025-01-01","expiresAt":"2026-12-31","hasSize":true}]',
      },
    });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/hse-compliance/safety-management');
    const body = JSON.parse(init.body);
    expect(body.action).toBe('ppe');
    expect(body.input.employees).toHaveLength(1);
  });

  it('renders the PPE coverage % verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              totals: {
                employeesInScope: 1,
                requirementsChecked: 1,
                failures: 0,
                coveragePct: 100,
              },
            },
          },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Employees/i), { target: { value: '[]' } });
    fireEvent.change(screen.getByLabelText(/Requirements/i), { target: { value: '[]' } });
    fireEvent.change(screen.getByLabelText(/Issuances/i), { target: { value: '[]' } });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/100% coverage/)).toBeInTheDocument());
  });
});
