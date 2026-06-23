// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/er-compliance/retaliation-protection.service', () => ({
  retaliationProtectionService: {
    resolveProtectionWindow: vi.fn(),
    assessAdverseAction: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { GET, POST } from '@/app/api/v1/er-compliance/retaliation-check/route';
import { retaliationProtectionService } from '@/lib/services/er-compliance/retaliation-protection.service';

const svc = retaliationProtectionService as unknown as any;

function makeGetReq(query: Record<string, string>, permissions: string[] = ['employee:read']) {
  const usp = new URLSearchParams(query);
  return [
    { json: async () => ({}), url: `http://x/api?${usp.toString()}` } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

function makePostReq(body: unknown, permissions: string[] = ['risk_register:manage']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1', email: 'u@x.com' }, permissions } as any,
  ] as const;
}

describe('GET /api/v1/er-compliance/retaliation-check', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeGetReq({ employeeId: 'e1' }, []);
    const res = await GET(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on missing employeeId', async () => {
    const [req, ctx] = makeGetReq({});
    const res = await GET(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with protection window', async () => {
    svc.resolveProtectionWindow.mockResolvedValue({ active: true, expiresOn: '2026-12-31' });
    const [req, ctx] = makeGetReq({ employeeId: 'e1', country: 'AE' });
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.window.active).toBe(true);
    expect(svc.resolveProtectionWindow).toHaveBeenCalledWith('t1', 'e1', 'AE', expect.any(Date));
  });
});

describe('POST /api/v1/er-compliance/retaliation-check', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makePostReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makePostReq({ employeeId: 'e1' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 + verdict on valid input', async () => {
    svc.assessAdverseAction.mockResolvedValue({ allow: false, reasonEn: 'Protected window' });
    const [req, ctx] = makePostReq({
      employeeId: 'e1',
      actionType: 'TERMINATION',
      country: 'AE',
      justification: 'docs',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.allow).toBe(false);
    expect(svc.assessAdverseAction).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: 'e1',
        actionType: 'TERMINATION',
        country: 'AE',
      }),
      expect.objectContaining({ tenantId: 't1', userId: 'u1' })
    );
  });
});
