// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/checklist-engine/red-flag-automation/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Red-Flag Automation page', () => {
  it('renders title and rule/event fields', () => {
    render(<Page />);
    expect(screen.getByText(/red-flag automation rule test/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Candidate rules/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event payload/i)).toBeInTheDocument();
  });

  it('submits payload to the automation test endpoint', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { firing: [{ code: 'RUN_SIZE_SPIKE' }], totalCandidates: 1 } },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Candidate rules/i), {
      target: {
        value:
          '[{"code":"RUN_SIZE_SPIKE","isActive":true,"expression":"payload.totalNet > thresholds.netCap","thresholdJson":{"netCap":1000000}}]',
      },
    });
    await user.type(screen.getByLabelText(/Event type/i), 'payroll.run.completed');
    fireEvent.change(screen.getByLabelText(/Event payload/i), {
      target: { value: '{"totalNet":1500000}' },
    });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/checklist-engine/red-flag-automation/test');
    const body = JSON.parse(init.body);
    expect(body.event.type).toBe('payroll.run.completed');
    expect(body.event.payload.totalNet).toBe(1500000);
  });

  it('renders the firing-rules WARN verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { firing: [{ code: 'RUN_SIZE_SPIKE' }], totalCandidates: 1 } },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Candidate rules/i), { target: { value: '[]' } });
    await user.type(screen.getByLabelText(/Event type/i), 'payroll.run.completed');
    fireEvent.change(screen.getByLabelText(/Event payload/i), { target: { value: '{}' } });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() =>
      expect(screen.getByText(/1 of 1 rule\(s\) would fire/)).toBeInTheDocument()
    );
  });
});
