// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Page from '@/app/dashboard/compliance-dashboard/risk-heatmap/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

function emptyHeatmap() {
  return {
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          cells: [],
          totals: { flagsInScope: 0, cells: 0, domains: 0, countries: 0 },
        },
      }),
  };
}

function emptyTree() {
  return {
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          label: 'Global',
          level: 'GLOBAL',
          flagCount: 0,
          riskScore: 0,
          children: [],
          topFive: [],
        },
      }),
  };
}

describe('Risk Heatmap dashboard page', () => {
  it('renders title and filter controls', async () => {
    fetchMock.mockResolvedValueOnce(emptyHeatmap()).mockResolvedValueOnce(emptyTree());
    render(<Page />);
    expect(screen.getByText(/risk heatmap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Domain/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('fetches both the heatmap and the drill-down endpoints in parallel', async () => {
    fetchMock.mockResolvedValueOnce(emptyHeatmap()).mockResolvedValueOnce(emptyTree());
    render(<Page />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.startsWith('/api/v1/compliance-dashboard/risk-heatmap'))).toBe(true);
    expect(urls.some((u) => u.startsWith('/api/v1/compliance-dashboard/drill-down'))).toBe(true);
  });

  it('renders heatmap totals summary from the API response', async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              cells: [
                {
                  domain: 'PAYROLL',
                  country: 'AE',
                  riskScore: 80,
                  flagCount: 5,
                  maxSeverity: 'HIGH',
                },
              ],
              totals: { flagsInScope: 5, cells: 1, domains: 1, countries: 1 },
            },
          }),
      })
      .mockResolvedValueOnce(emptyTree());
    render(<Page />);
    // The summary text is split across literals + interpolated counts; use a
    // function matcher to ignore the surrounding whitespace + dots.
    await waitFor(() =>
      expect(
        screen.getAllByText(
          (_, el) =>
            (el?.textContent ?? '').includes('5 flags') &&
            (el?.textContent ?? '').includes('1 domains × 1 countries')
        ).length
      ).toBeGreaterThan(0)
    );
  });
});
