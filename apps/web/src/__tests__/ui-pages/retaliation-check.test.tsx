// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/er-compliance/retaliation-check/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Retaliation Check page', () => {
  it('renders title and form', () => {
    render(<Page />);
    expect(screen.getByText(/retaliation protection check/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Action type/i)).toBeInTheDocument();
  });

  it('submits payload to retaliation-check endpoint', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { allow: true, reasonEn: 'No active window' } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.selectOptions(screen.getByLabelText(/Action type/i), 'TERMINATION');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/er-compliance/retaliation-check');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toMatchObject({
      employeeId: 'E1',
      actionType: 'TERMINATION',
    });
  });

  it('renders blocked title when verdict.allow=false', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              allow: false,
              reasonEn: 'Active whistleblower protection',
              protectionActive: true,
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.selectOptions(screen.getByLabelText(/Action type/i), 'TERMINATION');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/Action blocked/i)).toBeInTheDocument());
    expect(screen.getByText(/Active whistleblower protection/i)).toBeInTheDocument();
  });
});
