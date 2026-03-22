import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SharedServiceRequestService } from '@/app/dashboard/core-hr/services';

describe('SharedServiceRequestService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads requests from the core-HR shared services route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          requests: [
            {
              requestId: 'ssr-1',
              requestorId: 'emp-1',
              requestorName: 'Jane Doe',
              category: 'it_access',
              subject: 'VPN Access',
              details: 'Need VPN access',
              priority: 'high',
              status: 'open',
              createdDate: '2026-03-22T00:00:00.000Z',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const requests = await SharedServiceRequestService.getAllRequests();

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      requestId: 'ssr-1',
      requestorName: 'Jane Doe',
      category: 'it_access',
      status: 'open',
    });
    expect(requests[0]?.createdDate).toBeInstanceOf(Date);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/shared-services');
  });

  it('creates requests through the core-HR shared services route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          request: {
            requestId: 'ssr-2',
            requestorId: 'emp-1',
            requestorName: 'Jane Doe',
            category: 'hr_letter',
            subject: 'NOC Letter',
            priority: 'medium',
            status: 'open',
            createdDate: '2026-03-22T00:00:00.000Z',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const request = await SharedServiceRequestService.createRequest({
      category: 'hr_letter',
      subject: 'NOC Letter',
      details: 'For bank use',
      priority: 'medium',
    });

    expect(request).toMatchObject({
      requestId: 'ssr-2',
      category: 'hr_letter',
      subject: 'NOC Letter',
    });
    expect(request.createdDate).toBeInstanceOf(Date);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/shared-services');
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });
  });
});