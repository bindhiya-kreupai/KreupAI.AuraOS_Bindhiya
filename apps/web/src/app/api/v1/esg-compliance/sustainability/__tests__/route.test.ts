// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/esg-compliance/sustainability/route';

function makeReq(body: unknown, permissions: string[] = ['esg:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/esg-compliance/sustainability', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({ action: 'diversity', input: { employees: [] } }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid action', async () => {
    const [req, ctx] = makeReq({ action: 'nope' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with diversity verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'diversity',
      input: {
        employees: [
          {
            employeeId: 'e1',
            gender: 'F',
            nationality: 'SAU',
            ageBracket: '30-50',
            jobLevel: 'EXEC',
          },
        ],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.headcount).toBe(1);
    expect(json.data.verdict.totals.femalePct).toBe(100);
  });

  it('returns 200 with carbon verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'carbon',
      input: { headcount: 100, scope1: 50, scope2: 50 },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totalEmissionsTco2e).toBe(100);
    expect(json.data.verdict.perEmployeeTco2e).toBe(1);
  });

  it('returns 200 with disclosure verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'disclosure',
      input: {
        disclosures: [{ code: 'GHG', label: 'GHG', mandatory: true, filed: false }],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.missing).toBe(1);
  });
});
