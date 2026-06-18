// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/ess/record-change-request.service', () => ({
  employeeRecordChangeRequestService: {
    propose: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    listPending: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { GET, POST } from '@/app/api/v1/employee/record-change-requests/route';
import { employeeRecordChangeRequestService } from '@/lib/services/ess/record-change-request.service';

const svc = employeeRecordChangeRequestService as unknown as any;

function makeReq(body: unknown, permissions: string[] = ['employee:manage']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('employee/record-change-requests route', () => {
  beforeEach(() => vi.clearAllMocks());

  it('POST returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('POST returns 400 on missing fields', async () => {
    const [req, ctx] = makeReq({ action: 'propose' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('GET returns 200 + pending list', async () => {
    svc.listPending.mockResolvedValue([{ requestId: 'r1', status: 'PENDING' }]);
    const [req, ctx] = makeReq({}, ['employee:read']);
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.total).toBe(1);
  });

  it('POST propose returns 200 + record', async () => {
    svc.propose.mockResolvedValue({ requestId: 'r1', status: 'PENDING', inlineEligible: false });
    const [req, ctx] = makeReq({
      action: 'propose',
      employeeId: 'e1',
      changes: [{ field: 'bankAccountIban', before: 'a', after: 'b' }],
      justification: 'corrected by employee',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.record.requestId).toBe('r1');
    expect(svc.propose).toHaveBeenCalledWith(
      expect.objectContaining({ employeeId: 'e1', justification: 'corrected by employee' }),
      expect.objectContaining({ tenantId: 't1' })
    );
  });

  it('POST approve returns 200 + record', async () => {
    svc.approve.mockResolvedValue({ requestId: 'r1', status: 'APPROVED' });
    const [req, ctx] = makeReq({ action: 'approve', requestId: 'r1' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.record.status).toBe('APPROVED');
  });

  it('POST reject returns 200 + record', async () => {
    svc.reject.mockResolvedValue({ requestId: 'r1', status: 'REJECTED' });
    const [req, ctx] = makeReq({ action: 'reject', requestId: 'r1', reason: 'bad' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(200);
    expect(svc.reject).toHaveBeenCalledWith('r1', 'bad', expect.anything());
  });
});
