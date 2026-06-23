// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/organization/org-change-request.service', () => ({
  orgChangeRequestService: {
    propose: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    listPending: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { GET, POST } from '@/app/api/v1/org-compliance/change-requests/route';
import { orgChangeRequestService } from '@/lib/services/organization/org-change-request.service';

const svc = orgChangeRequestService as unknown as any;

function makeReq(body: unknown, permissions: string[] = ['organization:manage']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('org-compliance/change-requests route', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await GET(req, ctx);
    expect(res.status).toBe(403);
  });

  it('POST returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('POST returns 400 on missing action', async () => {
    const [req, ctx] = makeReq({});
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('GET returns 200 + list of pending requests', async () => {
    svc.listPending.mockResolvedValue([{ requestId: 'r1', status: 'PENDING' }]);
    const [req, ctx] = makeReq({}, ['organization:read']);
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.records).toHaveLength(1);
    expect(json.data.total).toBe(1);
    expect(svc.listPending).toHaveBeenCalledWith('t1');
  });

  it('POST propose returns 200 + record', async () => {
    svc.propose.mockResolvedValue({ requestId: 'r1', status: 'PENDING' });
    const [req, ctx] = makeReq({
      action: 'propose',
      entity: 'department',
      operation: 'CREATE',
      payload: { name: 'Eng' },
      justification: 'New dept',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.record.requestId).toBe('r1');
    expect(svc.propose).toHaveBeenCalledWith(
      expect.objectContaining({ entity: 'department', operation: 'CREATE' }),
      expect.objectContaining({ tenantId: 't1', userId: 'u1' })
    );
  });

  it('POST approve returns 200 + record', async () => {
    svc.approve.mockResolvedValue({ requestId: 'r1', status: 'APPROVED' });
    const [req, ctx] = makeReq({ action: 'approve', requestId: 'r1' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.record.status).toBe('APPROVED');
    expect(svc.approve).toHaveBeenCalledWith('r1', expect.anything());
  });

  it('POST reject returns 200 + record', async () => {
    svc.reject.mockResolvedValue({ requestId: 'r1', status: 'REJECTED' });
    const [req, ctx] = makeReq({ action: 'reject', requestId: 'r1', reason: 'bad data' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.record.status).toBe('REJECTED');
    expect(svc.reject).toHaveBeenCalledWith('r1', 'bad data', expect.anything());
  });
});
