// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RuleChangeRequestsPage from './page';

const pendingRequest = {
  id: 'req-1',
  rulePackId: 'pack-1234-5678',
  action: 'PUBLISH',
  status: 'PENDING_APPROVAL',
  rationale: 'New KSA decree',
  sourceReference: 'GAZETTE-2026-01',
  requestedBy: 'maker@example.com',
  requestedAt: '2026-07-01T00:00:00Z',
  approvedBy: null,
  approvedAt: null,
  rejectedBy: null,
  rejectedAt: null,
  rejectionReason: null,
  previousVersion: null,
};

describe('RuleChangeRequestsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads live change requests from the API (no mock data)', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [pendingRequest] }),
      } as Response)
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<RuleChangeRequestsPage />);

    await waitFor(() => {
      expect(screen.getByText('New KSA decree')).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/gcc-rule-library/rule-change-requests')
    );
  });

  it('rejects via an inline reason field (no window.prompt) and posts to the API', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      if (body?.action === 'reject') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [pendingRequest] }),
      } as Response);
    });
    vi.stubGlobal('fetch', fetchMock);
    const promptSpy = vi.fn();
    vi.stubGlobal('prompt', promptSpy);

    render(<RuleChangeRequestsPage />);
    await waitFor(() => expect(screen.getByText('New KSA decree')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    fireEvent.change(screen.getByPlaceholderText('Rejection reason (required)'), {
      target: { value: 'Insufficient legal basis' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm reject' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/gcc-rule-library/rule-change-requests',
        expect.objectContaining({ method: 'POST' })
      );
    });
    const rejectCall = fetchMock.mock.calls.find((c) => {
      const init = c[1] as RequestInit | undefined;
      return init?.body ? JSON.parse(String(init.body)).action === 'reject' : false;
    });
    expect(rejectCall).toBeTruthy();
    expect(JSON.parse(String((rejectCall![1] as RequestInit).body)).reason).toBe(
      'Insufficient legal basis'
    );
    expect(promptSpy).not.toHaveBeenCalled();
  });
});
