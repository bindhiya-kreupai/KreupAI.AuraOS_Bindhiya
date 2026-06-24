// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/document-retention-compliance/classify/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Document Classify page', () => {
  it('renders title and required fields', () => {
    render(<Page />);
    expect(screen.getByText(/document classification/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filename/i)).toBeInTheDocument();
  });

  it('submits filename payload to the classify endpoint', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              category: 'PAYSLIP',
              matchedOn: 'filename',
              retention: { retentionYears: 7, retainFromSeparation: false, regulatoryBasis: 'FTA' },
              expiry: '2033-01-01',
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Filename/i), 'payslip-jan-2026.pdf');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/document-retention-compliance/classify');
    expect(JSON.parse(init.body)).toMatchObject({ filename: 'payslip-jan-2026.pdf' });
  });

  it('renders the document category in the verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              category: 'PAYSLIP',
              matchedOn: 'filename',
              retention: { retentionYears: 7, retainFromSeparation: false, regulatoryBasis: 'FTA' },
              expiry: '2033-01-01',
            },
          },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Filename/i), 'payslip.pdf');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getAllByText(/PAYSLIP/).length).toBeGreaterThan(0));
  });
});
