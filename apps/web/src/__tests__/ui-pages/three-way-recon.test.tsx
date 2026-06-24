// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/nitaqat-compliance/three-way-recon/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Three-Way Reconciliation page', () => {
  it('renders title and three structured array headers', () => {
    render(<Page />);
    expect(screen.getByText(/Nitaqat \/ GOSI \/ Mudad reconciliation/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Qiwa records/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/GOSI records/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mudad records/i).length).toBeGreaterThan(0);
  });

  it('submits structured rows to the three-way-recon endpoint after adding rows', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            result: {
              totals: {
                discrepancies: 0,
                qiwa: 0,
                gosi: 0,
                mudad: 0,
                qiwaOnly: 0,
                qiwaGosiNotMudad: 0,
                qiwaMudadNotGosi: 0,
                gosiMudadNotQiwa: 0,
                wageMismatch: 0,
              },
            },
          },
        }),
    });
    const { container } = render(<Page />);
    // Each structured-array has its own Add row button — click all three.
    const addBtns = screen.getAllByRole('button', { name: /add row/i });
    for (const btn of addBtns) await user.click(btn);

    // Fill the first row of each — duplicates use getAllByLabelText.
    const ids = screen.getAllByLabelText(/National ID row 1/i);
    expect(ids.length).toBe(3);
    for (const inp of ids) await user.type(inp, '1234567890');

    const decWage = screen.getAllByLabelText(/Declared wage \(SAR\) row 1/i);
    for (const inp of decWage) await user.type(inp, '5000');
    const contWage = screen.getAllByLabelText(/Contribution wage \(SAR\) row 1/i);
    for (const inp of contWage) await user.type(inp, '5000');
    const paidWage = screen.getAllByLabelText(/Paid wage \(SAR\) row 1/i);
    for (const inp of paidWage) await user.type(inp, '5000');

    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/nitaqat-compliance/three-way-recon');
  });

  it('renders zero-discrepancy PASS verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            result: {
              totals: {
                discrepancies: 0,
                qiwa: 0,
                gosi: 0,
                mudad: 0,
                qiwaOnly: 0,
                qiwaGosiNotMudad: 0,
                qiwaMudadNotGosi: 0,
                gosiMudadNotQiwa: 0,
                wageMismatch: 0,
              },
            },
          },
        }),
    });
    const { container } = render(<Page />);
    const addBtns = screen.getAllByRole('button', { name: /add row/i });
    for (const btn of addBtns) await user.click(btn);
    const ids = screen.getAllByLabelText(/National ID row 1/i);
    for (const inp of ids) await user.type(inp, '1');
    const decWage = screen.getAllByLabelText(/Declared wage \(SAR\) row 1/i);
    for (const inp of decWage) await user.type(inp, '5000');
    const contWage = screen.getAllByLabelText(/Contribution wage \(SAR\) row 1/i);
    for (const inp of contWage) await user.type(inp, '5000');
    const paidWage = screen.getAllByLabelText(/Paid wage \(SAR\) row 1/i);
    for (const inp of paidWage) await user.type(inp, '5000');

    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(screen.getByText(/0 discrepancies/)).toBeInTheDocument());
  });
});
