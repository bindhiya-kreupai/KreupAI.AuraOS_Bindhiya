// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/wps-compliance/release-gate/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('WPS Release Gate page', () => {
  it('renders title and submission ID field', () => {
    render(<Page />);
    expect(screen.getByText(/wps release gate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Submission ID/i)).toBeInTheDocument();
  });

  it('submits action=release payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              released: true,
              submissionId: 'S1',
              releasedBy: 'u1',
              releasedAt: '2026-06-17T00:00:00Z',
              forced: false,
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Submission ID/i), 'S1');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/wps-compliance/release-gate');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      action: 'release',
      submissionId: 'S1',
      force: false,
    });
  });

  it('renders Refused FAIL verdict on release block', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              released: false,
              reason: 'PREPARER_EQUALS_RELEASER',
              reasonEn: 'Preparer cannot release their own submission',
              preparedBy: 'u1',
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Submission ID/i), 'S1');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/Refused/)).toBeInTheDocument());
    expect(screen.getByText(/Preparer cannot release/)).toBeInTheDocument();
  });
});
