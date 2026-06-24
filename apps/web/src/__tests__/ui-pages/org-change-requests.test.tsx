// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/org-compliance/change-requests/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Org Change Request page', () => {
  it('renders title and key fields', () => {
    render(<Page />);
    expect(screen.getByText(/org change request/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Entity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Operation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Justification/i)).toBeInTheDocument();
  });

  it('submits propose payload to the change-requests endpoint', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            record: {
              requestId: 'r1',
              status: 'PENDING',
              entity: 'department',
              operation: 'CREATE',
              proposedBy: 'u1',
            },
          },
        }),
    });
    render(<Page />);
    await user.selectOptions(screen.getByLabelText(/Entity/i), 'department');
    await user.selectOptions(screen.getByLabelText(/Operation/i), 'CREATE');
    await user.type(screen.getByLabelText(/Justification/i), 'new dept needed');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/org-compliance/change-requests');
    expect(JSON.parse(init.body)).toMatchObject({
      action: 'propose',
      entity: 'department',
      operation: 'CREATE',
      justification: 'new dept needed',
    });
  });

  it('renders the verdict status from the response', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            record: {
              requestId: 'r123abcd',
              status: 'PENDING',
              entity: 'department',
              operation: 'CREATE',
              proposedBy: 'u1',
            },
          },
        }),
    });
    render(<Page />);
    await user.selectOptions(screen.getByLabelText(/Entity/i), 'department');
    await user.selectOptions(screen.getByLabelText(/Operation/i), 'CREATE');
    await user.type(screen.getByLabelText(/Justification/i), 'needed');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getAllByText(/PENDING/).length).toBeGreaterThan(0));
  });
});
