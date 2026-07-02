// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import WebhookManagerPage from './page';

const originalFetch = global.fetch;

function mockFetchOnce(map: Record<string, unknown>) {
  global.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    const key = Object.keys(map).find((k) => url.includes(k));
    const body = key ? map[key] : { success: true, data: [] };
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    }) as unknown as Promise<Response>;
  }) as unknown as typeof fetch;
}

describe('WebhookManagerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders an empty state when no webhooks exist', async () => {
    mockFetchOnce({
      '/api/v1/webhooks': { success: true, data: [], pagination: { total: 0 } },
    });

    render(<WebhookManagerPage />);

    await waitFor(() => {
      expect(screen.getByText(/No webhook endpoints configured/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /add webhook/i })).toBeEnabled();
  });

  it('renders live webhook rows from the API', async () => {
    mockFetchOnce({
      '/api/v1/webhooks': {
        success: true,
        data: [
          {
            id: 'wh-1',
            url: 'https://example.com/hooks/x',
            events: ['employee.created'],
            active: true,
            retryCount: 3,
            lastDeliveryAt: null,
            lastDeliveryStatus: null,
            createdAt: '2026-07-01T00:00:00.000Z',
          },
        ],
        pagination: { total: 1 },
      },
    });

    render(<WebhookManagerPage />);

    await waitFor(() => {
      expect(screen.getByText('https://example.com/hooks/x')).toBeInTheDocument();
    });
    expect(screen.getByText('employee.created')).toBeInTheDocument();
    // "Active" appears both as a stats label and the row status badge.
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('opens the add-webhook modal and validates URL', async () => {
    mockFetchOnce({
      '/api/v1/webhooks': { success: true, data: [], pagination: { total: 0 } },
    });

    render(<WebhookManagerPage />);

    await waitFor(() => {
      expect(screen.getByText(/No webhook endpoints configured/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /add webhook/i }));
    expect(screen.getByText('Endpoint URL')).toBeInTheDocument();

    // Try to create without URL -> validation error
    fireEvent.click(screen.getByRole('button', { name: /create webhook/i }));
    await waitFor(() => {
      expect(screen.getByText(/Endpoint URL is required/i)).toBeInTheDocument();
    });
  });
});
