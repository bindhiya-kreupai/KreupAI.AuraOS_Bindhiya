// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/vendor-compliance/screening/route';

function makeReq(body: unknown, permissions: string[] = ['vendor:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/vendor-compliance/screening', () => {
  it('403 without permission', async () => {
    const [req, ctx] = makeReq({ action: 'dueDiligence', input: { vendors: [] } }, []);
    expect((await POST(req, ctx)).status).toBe(403);
  });

  it('400 on invalid', async () => {
    const [req, ctx] = makeReq({ action: 'dueDiligence' });
    expect((await POST(req, ctx)).status).toBe(400);
  });

  it('200 dueDiligence verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'dueDiligence',
      input: {
        vendors: [{ vendorId: 'v1', name: 'X', riskTier: 'CRITICAL' }],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.overdue).toBe(1);
  });

  it('200 coi verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'coi',
      input: {
        links: [{ vendorId: 'v1', employeeId: 'e1' }],
        disclosures: [],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.undisclosed).toBe(1);
  });

  it('200 sanctions verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'sanctions',
      input: {
        vendors: [{ vendorId: 'v1', name: 'Bad Guys LLC' }],
        list: [{ listCode: 'OFAC', name: 'Bad Guys LLC' }],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.hits).toBe(1);
  });
});
