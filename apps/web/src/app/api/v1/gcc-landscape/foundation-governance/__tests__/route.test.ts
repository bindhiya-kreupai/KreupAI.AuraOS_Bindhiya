// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/gcc-landscape/foundation-governance/route';

function makeReq(body: unknown, permissions: string[] = ['compliance:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/gcc-landscape/foundation-governance', () => {
  it('returns 403 without permission', async () => {
    const [req, ctx] = makeReq({ action: 'error-catalog', code: 'E4030' }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid discriminator', async () => {
    const [req, ctx] = makeReq({ action: 'xxx' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 for error-catalog action', async () => {
    const [req, ctx] = makeReq({ action: 'error-catalog', code: 'E4030' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.matched).toBe(true);
  });

  it('returns 200 for pii-mask action', async () => {
    const [req, ctx] = makeReq({
      action: 'pii-mask',
      record: { name: 'Sabu', iban: 'AE070331234567890123456' },
      policy: { fields: { iban: 'PARTIAL', name: 'NONE' } },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.masked.name).toBe('Sabu');
  });

  it('returns 200 for audit-summary action', async () => {
    const [req, ctx] = makeReq({
      action: 'audit-summary',
      events: [
        {
          action: 'USER_LOGIN',
          severity: 'INFO',
          timestamp: new Date(Date.UTC(2026, 5, 1, 10)).toISOString(),
        },
      ],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.events).toBe(1);
  });
});
