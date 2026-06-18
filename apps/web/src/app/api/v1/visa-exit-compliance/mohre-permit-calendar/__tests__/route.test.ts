// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/visa-exit-compliance/mohre-permit-calendar/route';

function makeReq(body: unknown, permissions: string[] = ['visa:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/visa-exit-compliance/mohre-permit-calendar', () => {
  it('returns 403 without permission', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 with empty permits', async () => {
    const [req, ctx] = makeReq({ permits: [] });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with verdict', async () => {
    const future = new Date(Date.now() + 30 * 86400000).toISOString();
    const [req, ctx] = makeReq({
      permits: [{ permitId: 'P1', employeeId: 'E1', expiresAt: future }],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.rows).toHaveLength(1);
  });
});
