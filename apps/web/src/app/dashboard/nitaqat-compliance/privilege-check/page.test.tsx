// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NitaqatPrivilegeCheckPage from './page';

describe('NitaqatPrivilegeCheckPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists band snapshots from the API on load', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 's1',
                legalEntityId: null,
                snapshotDate: '2026-06-01',
                saudizationPct: '14.50',
                band: 'GREEN',
              },
            ],
          }),
      } as Response)
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<NitaqatPrivilegeCheckPage />);

    await waitFor(() => {
      expect(screen.getByText('14.50')).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/nitaqat-compliance/snapshots');
  });

  it('runs a live privilege check and shows the gate result', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('privilege-check') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { allowed: true, band: 'PLATINUM' } }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<NitaqatPrivilegeCheckPage />);

    fireEvent.click(screen.getByRole('button', { name: /check privilege/i }));

    await waitFor(() => {
      expect(screen.getByText('Privilege permitted')).toBeInTheDocument();
    });
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input).includes('/api/v1/nitaqat-compliance/privilege-check') &&
          (init as RequestInit | undefined)?.method === 'POST'
      )
    ).toBe(true);
  });
});
