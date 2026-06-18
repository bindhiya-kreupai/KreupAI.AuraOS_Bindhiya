// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/benefits-compliance/eligibility/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Benefits Eligibility page', () => {
  it('renders title and benefitCode + employeeId fields', () => {
    render(<Page />);
    expect(screen.getByText(/benefits eligibility/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Benefit code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
  });

  it('submits action=evaluate with nested employee context', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { eligible: true, reason: 'Active employee', benefitCode: 'X' } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Benefit code/i), 'MEDICAL_INSURANCE_UAE');
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/benefits-compliance/eligibility');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      action: 'evaluate',
      benefitCode: 'MEDICAL_INSURANCE_UAE',
      context: { employee: { id: 'E1' } },
    });
  });

  it('renders eligible PASS verdict from response', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              eligible: true,
              reason: 'All gates pass',
              benefitCode: 'MEDICAL_INSURANCE_UAE',
              reasonCode: 'OK',
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Benefit code/i), 'MEDICAL_INSURANCE_UAE');
    await user.type(screen.getByLabelText(/Employee ID/i), 'E1');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/All gates pass/)).toBeInTheDocument());
  });
});
