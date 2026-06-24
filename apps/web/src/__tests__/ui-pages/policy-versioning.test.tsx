// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/hr-policies-compliance/policy-versioning/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Policy Versioning page', () => {
  it('renders title and action selector', () => {
    render(<Page />);
    expect(screen.getByText(/policy versioning/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Action/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Policy ID/i)).toBeInTheDocument();
  });

  it('submits verifyAcknowledgement payload by default', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { match: true, ackVersion: 'v1.1', currentVersion: 'v1.1' } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Policy ID/i), 'P1');
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/hr-policies-compliance/policy-versioning');
    expect(JSON.parse(init.body)).toMatchObject({
      action: 'verifyAcknowledgement',
      policyId: 'P1',
      employeeId: 'E1',
    });
  });

  it('renders FAIL verdict when acknowledgement is stale', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { match: false, ackVersion: 'v1.0', currentVersion: 'v1.2' } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Policy ID/i), 'P1');
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/Acknowledgement stale/i)).toBeInTheDocument());
  });
});
