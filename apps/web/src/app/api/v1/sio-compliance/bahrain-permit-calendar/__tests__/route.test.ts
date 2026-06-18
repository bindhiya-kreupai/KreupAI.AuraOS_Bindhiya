// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/sio-compliance/bahrain-permit-calendar/route';

function makeReq(body: unknown, permissions: string[] = ['sio:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/sio-compliance/bahrain-permit-calendar', () => {
  it('returns 403 without permission', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid discriminated union', async () => {
    const [req, ctx] = makeReq({ action: 'WRONG', input: {} });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 for LMRA action', async () => {
    const future = new Date(Date.now() + 60 * 86400000).toISOString();
    const [req, ctx] = makeReq({
      action: 'lmra',
      input: { permits: [{ permitId: 'L1', employeeId: 'E1', expiresAt: future }] },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.rows).toHaveLength(1);
  });

  it('returns 200 for SIO obligations', async () => {
    const [req, ctx] = makeReq({
      action: 'sio',
      input: {
        months: [{ wageMonth: new Date(Date.UTC(2026, 4, 1)).toISOString() }],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.rows).toHaveLength(2);
  });

  it('returns 200 for IGA wage protection', async () => {
    const [req, ctx] = makeReq({
      action: 'iga',
      input: {
        rows: [
          {
            employeeId: 'E1',
            wageMonth: new Date(Date.UTC(2026, 4, 1)).toISOString(),
            expectedAmountBhd: 500,
          },
        ],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.rows).toHaveLength(1);
  });
});
