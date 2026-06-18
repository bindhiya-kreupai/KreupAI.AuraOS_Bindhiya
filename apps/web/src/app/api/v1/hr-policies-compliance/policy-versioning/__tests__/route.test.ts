// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { publishMock, acknowledgeMock, verifyMock } = vi.hoisted(() => ({
  publishMock: vi.fn(),
  acknowledgeMock: vi.fn(),
  verifyMock: vi.fn(),
}));

vi.mock('@/lib/services/hr-policies-compliance/policy-versioning.service', () => {
  class PolicyVersioningService {
    publish = publishMock;
    acknowledge = acknowledgeMock;
    verifyAcknowledgement = verifyMock;
  }
  return { PolicyVersioningService };
});

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/hr-policies-compliance/policy-versioning/route';

function makeReq(body: unknown, permissions: string[] = ['policy:manage']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1', email: 'u1@x' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/hr-policies-compliance/policy-versioning', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({ action: 'publish', policyId: 'p1', version: '1' }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 when action is missing', async () => {
    const [req, ctx] = makeReq({});
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 on publish action', async () => {
    publishMock.mockResolvedValue({ policyId: 'p1', version: '2', publishedBy: 'u1' });
    const [req, ctx] = makeReq({
      action: 'publish',
      policyId: 'p1',
      version: '2',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.record.policyId).toBe('p1');
    expect(publishMock).toHaveBeenCalledWith(
      expect.objectContaining({ policyId: 'p1', version: '2' }),
      expect.objectContaining({ tenantId: 't1', userId: 'u1' })
    );
  });

  it('returns 200 on acknowledge action', async () => {
    acknowledgeMock.mockResolvedValue({
      policyId: 'p1',
      employeeId: 'e1',
      acknowledgedAt: new Date(),
    });
    const [req, ctx] = makeReq({
      action: 'acknowledge',
      policyId: 'p1',
      employeeId: 'e1',
      ipAddress: '1.2.3.4',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.record.employeeId).toBe('e1');
    expect(acknowledgeMock).toHaveBeenCalledWith(
      expect.objectContaining({ policyId: 'p1', employeeId: 'e1', ipAddress: '1.2.3.4' }),
      expect.anything()
    );
  });

  it('returns 200 on verifyAcknowledgement action', async () => {
    verifyMock.mockResolvedValue({ match: true, ackVersion: '1', currentVersion: '1' });
    const [req, ctx] = makeReq({
      action: 'verifyAcknowledgement',
      policyId: 'p1',
      employeeId: 'e1',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.match).toBe(true);
    expect(verifyMock).toHaveBeenCalledWith(
      expect.objectContaining({ policyId: 'p1', employeeId: 'e1', tenantId: 't1' })
    );
  });
});
