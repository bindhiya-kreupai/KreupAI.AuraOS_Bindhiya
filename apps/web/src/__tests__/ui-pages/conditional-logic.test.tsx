// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/hr-forms-compliance/conditional-logic/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('HR Form Conditional Logic page', () => {
  it('renders title and JSON fields', () => {
    render(<Page />);
    expect(screen.getByText(/hr form conditional logic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Form fields/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current values/i)).toBeInTheDocument();
  });

  it('submits payload to the conditional-logic endpoint', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              render: { fields: [{ code: 'reason', visible: true, required: true }] },
              missingRequired: ['reason'],
            },
          },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Form fields/i), {
      target: {
        value:
          '[{"code":"reason","label":"Reason","type":"text","requiredWhen":"values.action == \\u0027TERMINATE\\u0027"}]',
      },
    });
    fireEvent.change(screen.getByLabelText(/Current values/i), {
      target: { value: '{"action":"TERMINATE","reason":""}' },
    });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/hr-forms-compliance/conditional-logic');
    const body = JSON.parse(init.body);
    expect(Array.isArray(body.fields)).toBe(true);
    expect(body.values.action).toBe('TERMINATE');
  });

  it('renders missing-required FAIL verdict', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            verdict: {
              render: { fields: [{ code: 'reason', visible: true, required: true }] },
              missingRequired: ['reason'],
            },
          },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/Form fields/i), { target: { value: '[]' } });
    fireEvent.change(screen.getByLabelText(/Current values/i), { target: { value: '{}' } });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() =>
      expect(screen.getByText(/1 required field\(s\) missing/)).toBeInTheDocument()
    );
  });
});
