// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/whistleblower-compliance/cases/route';

function makeReq(body: unknown, permissions: string[] = ['whistleblower:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/whistleblower-compliance/cases', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({ action: 'retaliation', input: {} }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ action: 'retaliation', input: { reporters: 'oops' } });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 retaliation HIGH for in-window termination', async () => {
    const [req, ctx] = makeReq({
      action: 'retaliation',
      input: {
        reporters: [{ sealedId: 's1', filedAt: '2026-04-01T00:00:00.000Z' }],
        events: [
          {
            sealedId: 's1',
            eventType: 'TERMINATION',
            occurredAt: '2026-05-01T00:00:00.000Z',
          },
        ],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.findings[0].likelihood).toBe('HIGH');
  });

  it('returns 200 sla verdict with breach count', async () => {
    const [req, ctx] = makeReq({
      action: 'sla',
      input: {
        cases: [{ caseId: 'c1', intakeAt: '2026-01-01T00:00:00.000Z' }],
        config: { triageDays: 5, investigationDays: 30, closureDays: 90 },
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.breachPct).toBe(100);
  });
});
