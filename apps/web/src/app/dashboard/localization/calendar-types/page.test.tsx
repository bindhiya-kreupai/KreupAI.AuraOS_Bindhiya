// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CalendarTypesPage from './page';

describe('CalendarTypesPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders live Hijri date and Islamic holidays from the compliance API', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('action=toHijri')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                year: 1447,
                month: 1,
                day: 5,
                monthName: 'Muharram',
                formatted: '5 محرم 1447',
              },
            }),
        } as Response);
      }
      if (url.includes('action=holidays')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [{ name: 'Eid al-Fitr', nameAr: 'عيد الفطر', gregorianDate: '2026-03-20' }],
            }),
        } as Response);
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) } as Response);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<CalendarTypesPage />);

    await waitFor(() => {
      expect(screen.getByText('1447 AH')).toBeInTheDocument();
    });
    expect(screen.getByText('Eid al-Fitr')).toBeInTheDocument();
    expect(screen.getByText(/Muharram/)).toBeInTheDocument();
  });

  it('shows an error message when the calendar API fails', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: false, json: () => Promise.resolve({}) } as Response)
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<CalendarTypesPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Unable to load Hijri calendar data. Please try again.')
      ).toBeInTheDocument();
    });
  });
});
