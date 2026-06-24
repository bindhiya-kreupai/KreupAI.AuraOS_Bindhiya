// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Page from '@/app/dashboard/visa-exit-compliance/renewal-alerts/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

function emptyResponse() {
  return {
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          alerts: [],
          totals: { count: 0, critical: 0, urgent: 0, warning: 0, info: 0, overdue: 0 },
        },
      }),
  };
}

describe('Visa Renewal Alerts page', () => {
  it('renders title and severity filter control', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse());
    render(<Page />);
    expect(screen.getByText(/visa renewal alerts/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/As of/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Severity/i)).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });

  it('calls the renewal-alerts API with the asOf filter', async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse());
    render(<Page />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/^\/api\/v1\/visa-exit-compliance\/renewal-alerts\?asOf=/);
  });

  it('renders alert timeline items from the API response', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            alerts: [
              {
                visaId: 'V1',
                employeeId: 'E1',
                code: 'EXPIRES_30',
                severity: 'WARNING',
                daysFromExpiry: 30,
                message: 'Visa expires in 30 days',
                messageAr: 'تنتهي خلال 30 يوماً',
                dependents: [],
              },
            ],
            totals: { count: 1, critical: 0, urgent: 0, warning: 1, info: 0, overdue: 0 },
          },
        }),
    });
    render(<Page />);
    await waitFor(() => expect(screen.getByText(/Visa expires in 30 days/)).toBeInTheDocument());
  });
});
