// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/core-hr/record-change-requests/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Record Change Requests page', () => {
  it('renders title and required fields', () => {
    render(<Page />);
    expect(screen.getByText(/employee record change/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Field/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/After/i)).toBeInTheDocument();
  });

  it('submits propose payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { record: { requestId: 'r1', status: 'PENDING', inlineEligible: false } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.type(screen.getByLabelText(/Field/i), 'bankAccountIban');
    await user.type(screen.getByLabelText(/After/i), 'AE-NEW-IBAN');
    await user.type(screen.getByLabelText(/Justification/i), 'employee request');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/employee/record-change-requests');
    expect(JSON.parse(init.body)).toMatchObject({
      action: 'propose',
      employeeId: 'E1',
      justification: 'employee request',
    });
  });

  it('renders Queued verdict when status is PENDING', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            record: {
              requestId: 'r1',
              status: 'PENDING',
              inlineEligible: false,
              sensitiveChanges: ['bankAccountIban'],
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.type(screen.getByLabelText(/Field/i), 'bankAccountIban');
    await user.type(screen.getByLabelText(/After/i), 'X');
    await user.type(screen.getByLabelText(/Justification/i), 'reason');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/Queued for approval/)).toBeInTheDocument());
  });
});
