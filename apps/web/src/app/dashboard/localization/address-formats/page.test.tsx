// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AddressFormatsPage from './page';

describe('AddressFormatsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders address format cards for countries loaded from the master-data API', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              { id: 'c1', isoCode: 'AE', name: 'United Arab Emirates', currency: 'AED' },
              { id: 'c2', isoCode: 'US', name: 'United States', currency: 'USD' },
            ],
          }),
      } as Response)
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<AddressFormatsPage />);

    await waitFor(() => {
      expect(screen.getByText('United Arab Emirates')).toBeInTheDocument();
    });
    expect(screen.getByText('United States')).toBeInTheDocument();
    // AE-specific config field
    expect(screen.getByText('Emirate')).toBeInTheDocument();
  });

  it('shows an empty state when no countries are configured', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      } as Response)
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<AddressFormatsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('No countries configured. Add countries under Master Data.')
      ).toBeInTheDocument();
    });
  });
});
