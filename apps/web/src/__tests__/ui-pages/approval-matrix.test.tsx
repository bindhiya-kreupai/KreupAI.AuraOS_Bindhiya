// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/leave-compliance/approval-matrix/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Leave Approval Matrix page', () => {
  it('renders title and key fields', () => {
    render(<Page />);
    expect(screen.getByText(/leave approval matrix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Leave type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total days/i)).toBeInTheDocument();
  });

  it('submits the buildChain payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            rule: { id: 'R-ANNUAL-DEFAULT' },
            chain: [{ level: 1, role: 'MANAGER', required: true }],
          },
        }),
    });
    render(<Page />);
    await user.selectOptions(screen.getByLabelText(/Leave type/i), 'ANNUAL');
    await user.type(screen.getByLabelText(/Total days/i), '3');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/leave-compliance/approval-matrix');
    expect(JSON.parse(init.body)).toMatchObject({
      action: 'buildChain',
      leaveType: 'ANNUAL',
      totalDays: 3,
    });
  });

  it('renders the matched rule and chain depth in verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            rule: { id: 'R-ANNUAL-DEFAULT' },
            chain: [
              { level: 1, role: 'MANAGER', required: true },
              { level: 2, role: 'HR', required: true },
            ],
          },
        }),
    });
    render(<Page />);
    await user.selectOptions(screen.getByLabelText(/Leave type/i), 'ANNUAL');
    await user.type(screen.getByLabelText(/Total days/i), '5');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getAllByText(/R-ANNUAL-DEFAULT/).length).toBeGreaterThan(0));
  });
});
