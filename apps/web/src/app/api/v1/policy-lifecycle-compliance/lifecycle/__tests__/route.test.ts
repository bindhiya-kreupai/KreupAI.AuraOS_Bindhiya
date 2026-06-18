// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/policy-lifecycle-compliance/lifecycle/route';

function makeReq(body: unknown, permissions: string[] = ['policy:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/policy-lifecycle-compliance/lifecycle', () => {
  it('403 without permission', async () => {
    const [req, ctx] = makeReq({ action: 'review', input: { policies: [] } }, []);
    expect((await POST(req, ctx)).status).toBe(403);
  });

  it('400 on invalid', async () => {
    const [req, ctx] = makeReq({ action: 'review' });
    expect((await POST(req, ctx)).status).toBe(400);
  });

  it('200 review verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'review',
      input: {
        policies: [{ policyId: 'p1', title: 'X', active: true, reviewCadenceDays: 30 }],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.overdue).toBe(1);
  });

  it('200 diff verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'diff',
      input: { policyId: 'p1', previous: 'a\nb', next: 'a\nb\nc' },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.addedLines).toBe(1);
  });

  it('200 ack verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'ack',
      input: {
        requirements: [
          {
            policyId: 'p1',
            publishedAt: '2026-04-01T00:00:00.000Z',
            ackWindowDays: 30,
            audience: ['e1'],
          },
        ],
        records: [],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.overdue).toBe(1);
  });
});
