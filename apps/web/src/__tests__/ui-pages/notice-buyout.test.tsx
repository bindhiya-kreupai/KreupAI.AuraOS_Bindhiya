// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/separation-compliance/notice-buyout/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Notice Buyout page', () => {
  it('renders title and required form fields', () => {
    render(<Page />);
    expect(screen.getByText(/notice buyout calculator/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Basic salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notice required/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notice served/i)).toBeInTheDocument();
  });

  it('submits the buildPayload result to the buyout API', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              amount: 9000,
              currency: 'AED',
              formula: 'unservedDays * dailyRate',
              unservedDays: 30,
              dailyRate: 300,
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Basic salary/i), '9000');
    await user.clear(screen.getByLabelText(/Notice required/i));
    await user.type(screen.getByLabelText(/Notice required/i), '30');
    await user.type(screen.getByLabelText(/Notice served/i), '0');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/separation-compliance/notice-buyout');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      direction: 'EMPLOYER_BUYOUT',
      salary: { basicSalary: 9000, currency: 'AED' },
      noticeRequiredDays: 30,
      noticeServedDays: 0,
    });
  });

  it('renders the verdict amount + formula on success', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              amount: 9000,
              currency: 'AED',
              formula: 'unservedDays * dailyRate',
              unservedDays: 30,
              dailyRate: 300,
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Basic salary/i), '9000');
    await user.type(screen.getByLabelText(/Notice served/i), '0');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/unservedDays \* dailyRate/)).toBeInTheDocument());
    // Title format: "AED 9000.00" — multiple matches across title + breakdown
    expect(screen.getAllByText(/AED/).length).toBeGreaterThan(0);
  });
});
