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
  it('renders title and override JSON field', () => {
    render(<Page />);
    expect(screen.getByText(/rule-pack override simulation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Proposed overrides/i)).toBeInTheDocument();
  });

  it('parses JSON overrides and submits to simulate endpoint', async () => {
    const user = userEvent.setup();
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
    render(<Page />);
    // user.type interprets { as keyboard descriptor — use fireEvent.change for JSON.
    fireEvent.change(screen.getByLabelText(/Proposed overrides/i), {
      target: { value: '[{"domain":"GOSI","ruleKey":"EMPLOYER_RATE","value":0.115}]' },
    });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

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
    const user = userEvent.setup();
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
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Proposed overrides/i), {
      target: { value: '[{"domain":"GOSI","ruleKey":"EMPLOYER_RATE","value":0.115}]' },
    });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() =>
      expect(screen.getByText(/12 of 100 decision\(s\) would change/)).toBeInTheDocument()
    );
  });
});
