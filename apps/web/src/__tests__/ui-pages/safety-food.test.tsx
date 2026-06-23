// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/accommodation-compliance/safety-food/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Accommodation Food Safety page', () => {
  it('renders title and sanitation score field', () => {
    render(<Page />);
    expect(screen.getByText(/accommodation food safety/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sanitation score/i)).toBeInTheDocument();
  });

  it('submits action=food payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { pass: true, score: 90, band: 'GOOD', failures: [] } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Sanitation score/i), '5');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/accommodation-compliance/safety-controls');
    expect(JSON.parse(init.body)).toMatchObject({
      action: 'food',
      input: { sanitationScore: 5 },
    });
  });

  it('renders the food-safety verdict band', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { pass: true, score: 90, band: 'GOOD', failures: [] } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Sanitation score/i), '5');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/GOOD \(90\/100\)/)).toBeInTheDocument());
  });
});
