// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/attendance-compliance/absence-detection/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Absence Detection page', () => {
  it('renders title and key fields', () => {
    render(<Page />);
    expect(screen.getByText(/absence detection/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(document.getElementById('evaluator-field-date') as HTMLInputElement).toBeInTheDocument();
  });

  it('submits a single-day payload to the absence-detection endpoint', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdicts: [{ kind: 'PRESENT', employeeId: 'E1' }],
            summary: { total: 1, present: 1 },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.type(
      document.getElementById('evaluator-field-date') as HTMLInputElement,
      '2026-06-10'
    );
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/attendance-compliance/absence-detection');
    const body = JSON.parse(init.body);
    expect(body.days[0].employeeId).toBe('E1');
    expect(body.days[0].date).toBe('2026-06-10');
  });

  it('renders the PRESENT verdict title', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdicts: [{ kind: 'PRESENT' }],
            summary: { total: 1, present: 1 },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.type(
      document.getElementById('evaluator-field-date') as HTMLInputElement,
      '2026-06-10'
    );
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getAllByText(/PRESENT/).length).toBeGreaterThan(0));
  });
});
