// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/records-retention-compliance/lifecycle/route';

function makeReq(body: unknown, permissions: string[] = ['records:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/records-retention-compliance/lifecycle', () => {
  it('403 without permission', async () => {
    const [req, ctx] = makeReq({ action: 'retention', input: { records: [] } }, []);
    expect((await POST(req, ctx)).status).toBe(403);
  });

  it('400 on invalid', async () => {
    const [req, ctx] = makeReq({ action: 'retention' });
    expect((await POST(req, ctx)).status).toBe(400);
  });

  it('200 retention verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'retention',
      input: {
        records: [
          {
            recordId: 'r1',
            category: 'HR',
            createdAt: '2024-01-01T00:00:00.000Z',
            retentionDays: 365,
          },
        ],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.OVERDUE_FOR_DESTRUCTION).toBe(1);
  });

  it('200 legal-hold conflict', async () => {
    const [req, ctx] = makeReq({
      action: 'legalHold',
      input: {
        holds: [
          {
            holdId: 'h1',
            recordId: 'r1',
            startedAt: '2026-01-01T00:00:00.000Z',
            reason: 'Litigation',
          },
        ],
        requests: [{ recordId: 'r1', requestedAt: '2026-03-01T00:00:00.000Z' }],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.conflicts).toBe(1);
  });

  it('200 destruction defects', async () => {
    const [req, ctx] = makeReq({
      action: 'destruction',
      input: {
        entries: [{ recordId: 'r1', destroyedAt: '2026-06-01T00:00:00.000Z' }],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.defective).toBe(1);
  });
});
