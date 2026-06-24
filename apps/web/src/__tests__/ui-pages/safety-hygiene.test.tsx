// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/accommodation-compliance/safety-hygiene/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('Accommodation Hygiene page', () => {
  it('renders title and required fields', () => {
    render(<Page />);
    expect(screen.getByText(/accommodation hygiene check/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Occupants/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Toilet fixtures/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cleanliness score/i)).toBeInTheDocument();
  });

  it('submits action=hygiene payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { pass: true, score: 90, band: 'GOOD', failures: [] } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Occupants/i), '4');
    await user.type(screen.getByLabelText(/Toilet fixtures/i), '2');
    await user.type(screen.getByLabelText(/Shower fixtures/i), '2');
    await user.type(screen.getByLabelText(/Cleanliness score/i), '4');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/accommodation-compliance/safety-controls');
    expect(JSON.parse(init.body)).toMatchObject({
      action: 'hygiene',
      input: { occupants: 4, toiletFixtures: 2, showerFixtures: 2, cleanlinessScore: 4 },
    });
  });

  it('renders the PASS verdict band on success', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: { verdict: { pass: true, score: 90, band: 'GOOD', failures: [] } },
        }),
    });
    render(<Page />);
    await user.type(screen.getByLabelText(/Occupants/i), '4');
    await user.type(screen.getByLabelText(/Toilet fixtures/i), '2');
    await user.type(screen.getByLabelText(/Shower fixtures/i), '2');
    await user.type(screen.getByLabelText(/Cleanliness score/i), '4');
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/GOOD \(90\/100\)/)).toBeInTheDocument());
  });
});
