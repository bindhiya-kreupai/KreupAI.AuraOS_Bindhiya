// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/gcc-rule-library/simulate/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Rule Pack Simulate page', () => {
  it('renders title, country code field, and structured overrides editor', () => {
    render(<Page />);
    expect(screen.getByText(/rule-pack override simulation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country code/i)).toBeInTheDocument();
    // StructuredArrayEditor renders its own header label
    expect(screen.getByText(/Proposed overrides/i)).toBeInTheDocument();
    // Default seed row should be visible — verify domain "GOSI" pre-filled
    const firstRow = screen.getByLabelText(/Domain row 1/i) as HTMLInputElement;
    expect(firstRow.value).toBe('GOSI');
  });

  it('submits the pre-seeded override row to the simulate endpoint', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            result: {
              countryCode: 'AE',
              totals: { sampled: 100, differing: 5, netNumericDelta: 50 },
            },
          },
        }),
    });
    const { container } = render(<Page />);
    // Submit the form directly — the seed row + AE country code already
    // pass the required-field check; userEvent.click on the submit button
    // is flaky with the StructuredArrayEditor mounted (happy-dom focus
    // edge case).
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/gcc-rule-library/simulate');
    const body = JSON.parse(init.body);
    expect(body.countryCode).toBe('AE');
    expect(body.proposedOverrides).toEqual([
      { domain: 'GOSI', ruleKey: 'EMPLOYER_RATE', value: 0.115 },
    ]);
  });

  it('renders WARN verdict when differing > 0', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            result: {
              countryCode: 'AE',
              totals: { sampled: 100, differing: 12, netNumericDelta: 250.5 },
            },
          },
        }),
    });
    const { container } = render(<Page />);
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() =>
      expect(screen.getByText(/12 of 100 decision\(s\) would change/)).toBeInTheDocument()
    );
  });

  it('lets the user add and remove override rows', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('button', { name: /add row/i }));
    // Now should have a row 2
    expect(screen.getByLabelText(/Domain row 2/i)).toBeInTheDocument();
    // Remove row 2
    await user.click(screen.getByRole('button', { name: /remove row 2/i }));
    expect(screen.queryByLabelText(/Domain row 2/i)).toBeNull();
  });
});
