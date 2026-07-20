// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EmployeeLoansPage from './page';

describe('EmployeeLoansPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads loans from the paginated {items} envelope and renders amortized rows', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              items: [
                {
                  id: 'loan-1',
                  employeeId: 'EMP-001',
                  loanCode: 'LN-2026-01',
                  loanType: 'GENERAL',
                  principal: 12000,
                  installments: 12,
                  installmentAmount: 1000,
                  balance: 12000,
                  status: 'ACTIVE',
                },
              ],
              total: 1,
              page: 1,
              pageSize: 50,
              hasNextPage: false,
            },
          }),
      } as Response)
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<EmployeeLoansPage />);

    await waitFor(() => {
      expect(screen.getByText('LN-2026-01')).toBeInTheDocument();
    });
    expect(screen.getByText('EMP-001')).toBeInTheDocument();
    // amortized equal-installment figure surfaced in its own column
    expect(screen.getByText('1000')).toBeInTheDocument();
    // GET request was tenant-scoped server-side (no client ids in the URL)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/workforce-extensions/loans')
    );
  });

  it('shows an empty state when the loans list is empty', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { items: [], total: 0, page: 1, pageSize: 50, hasNextPage: false },
          }),
      } as Response)
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<EmployeeLoansPage />);

    await waitFor(() => {
      expect(screen.getByText('No loans yet.')).toBeInTheDocument();
    });
  });
});
