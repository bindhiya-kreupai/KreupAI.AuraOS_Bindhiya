// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/dashboard/sio-compliance/lmra-alignment/page';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  (globalThis as any).fetch = fetchMock;
});

describe('SIO LMRA Alignment page', () => {
  it('renders title and JSON inputs', () => {
    render(<Page />);
    expect(screen.getByText(/SIO ↔ LMRA alignment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SIO records/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/LMRA records/i)).toBeInTheDocument();
  });

  it('submits sio/lmra arrays to the alignment endpoint', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            result: {
              summary: {
                totalSio: 1,
                totalLmra: 1,
                onlyInSio: 0,
                onlyInLmra: 0,
                wageMismatch: 0,
                statusMismatch: 0,
                alignmentPct: 100,
              },
            },
          },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/SIO records/i), {
      target: { value: '[{"cpr":"123","declaredWageBhd":400,"status":"ACTIVE"}]' },
    });
    fireEvent.change(screen.getByLabelText(/LMRA records/i), {
      target: { value: '[{"cpr":"123","declaredWageBhd":400,"status":"ACTIVE"}]' },
    });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/sio-compliance/lmra-alignment');
    const body = JSON.parse(init.body);
    expect(body.sioRecords).toHaveLength(1);
    expect(body.lmraRecords).toHaveLength(1);
  });

  it('renders 100% aligned title on clean match', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            result: {
              summary: {
                totalSio: 1,
                totalLmra: 1,
                onlyInSio: 0,
                onlyInLmra: 0,
                wageMismatch: 0,
                statusMismatch: 0,
                alignmentPct: 100,
              },
            },
          },
        }),
    });
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/SIO records/i), {
      target: { value: '[{"cpr":"123","declaredWageBhd":400,"status":"ACTIVE"}]' },
    });
    fireEvent.change(screen.getByLabelText(/LMRA records/i), {
      target: { value: '[{"cpr":"123","declaredWageBhd":400,"status":"ACTIVE"}]' },
    });
    await user.click(screen.getByRole('button', { name: /evaluate/i }));
    await waitFor(() => expect(screen.getByText(/100% aligned/)).toBeInTheDocument());
  });
});
