// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/internal-audit-compliance/audit/route';

function makeReq(body: unknown, permissions: string[] = ['audit:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/internal-audit-compliance/audit', () => {
  it('403 without permission', async () => {
    const [req, ctx] = makeReq({ action: 'controls', input: { controls: [] } }, []);
    expect((await POST(req, ctx)).status).toBe(403);
  });

  it('400 on invalid', async () => {
    const [req, ctx] = makeReq({ action: 'controls' });
    expect((await POST(req, ctx)).status).toBe(400);
  });

  it('200 controls verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'controls',
      input: {
        controls: [{ controlId: 'c1', name: 'X', inScope: true, testCadenceDays: 30 }],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.overdue).toBe(1);
  });

  it('200 findings verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'findings',
      input: {
        findings: [{ findingId: 'f1', raisedAt: '2026-01-01T00:00:00.000Z', severity: 'CRITICAL' }],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.breached).toBe(1);
  });

  it('200 repeats verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'repeats',
      input: {
        history: [
          {
            findingId: 'f1',
            controlId: 'c1',
            category: 'A',
            raisedAt: '2026-01-01T00:00:00.000Z',
          },
          {
            findingId: 'f2',
            controlId: 'c1',
            category: 'A',
            raisedAt: '2026-03-01T00:00:00.000Z',
          },
        ],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.repeats).toBe(1);
  });
});
