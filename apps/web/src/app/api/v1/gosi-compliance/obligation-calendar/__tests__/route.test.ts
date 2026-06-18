// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/gosi-compliance/obligation-calendar/route';

function makeReq(body: unknown, permissions: string[] = ['gosi:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/gosi-compliance/obligation-calendar', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ months: [] });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with verdict for a valid month list', async () => {
    const [req, ctx] = makeReq({
      months: [
        { wageMonth: new Date(Date.UTC(2026, 4, 1)).toISOString() },
        {
          wageMonth: new Date(Date.UTC(2026, 5, 1)).toISOString(),
          wageFiled: true,
          contributionSettled: true,
        },
      ],
      asOf: new Date(Date.UTC(2026, 6, 1)).toISOString(),
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.rows).toHaveLength(4);
  });
});
