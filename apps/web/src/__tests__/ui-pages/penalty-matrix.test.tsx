// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/er-compliance/penalty-matrix/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Penalty Matrix page', () => {
  it('renders title and key fields', () => {
    render(<Page />);
    expect(screen.getByText(/disciplinary penalty matrix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Misconduct type/i)).toBeInTheDocument();
  });

  it('POSTs action=recommend payload to the route', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { recommendation: { action: 'WRITTEN_WARNING', escalationLevel: 2 } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.selectOptions(screen.getByLabelText(/Misconduct type/i), 'INSUBORDINATION');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/er-compliance/penalty-matrix');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toMatchObject({
      action: 'recommend',
      employeeId: 'E1',
      misconductType: 'INSUBORDINATION',
    });
  });

  it('renders the recommended action title from the verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            recommendation: {
              action: 'WRITTEN_WARNING',
              escalationLevel: 2,
              priorIncidents: 1,
              repeatOffender: false,
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.selectOptions(screen.getByLabelText(/Misconduct type/i), 'INSUBORDINATION');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getAllByText('WRITTEN_WARNING').length).toBeGreaterThan(0));
  });
});
