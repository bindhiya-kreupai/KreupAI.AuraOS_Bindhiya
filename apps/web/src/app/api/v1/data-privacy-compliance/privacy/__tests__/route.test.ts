// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/data-privacy-compliance/privacy/route';

function makeReq(body: unknown, permissions: string[] = ['privacy:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/data-privacy-compliance/privacy', () => {
  it('403 without permission', async () => {
    const [req, ctx] = makeReq({ action: 'dsar', input: { requests: [] } }, []);
    expect((await POST(req, ctx)).status).toBe(403);
  });

  it('400 on invalid', async () => {
    const [req, ctx] = makeReq({ action: 'nope' });
    expect((await POST(req, ctx)).status).toBe(400);
  });

  it('200 dsar verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'dsar',
      input: {
        requests: [
          {
            requestId: 'd1',
            receivedAt: '2026-04-01T00:00:00.000Z',
            jurisdiction: 'SAU',
          },
        ],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.breached).toBe(1);
  });

  it('200 transfer verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'transfer',
      input: {
        requests: [
          {
            transferId: 't1',
            fromCountry: 'SAU',
            toCountry: 'US',
            dataCategory: 'GENERIC',
            legalBasis: 'CONTRACT',
            hasDpia: false,
            hasDataSubjectConsent: false,
          },
        ],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.blocked).toBe(1);
  });

  it('200 consent verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'consent',
      input: {
        records: [
          {
            subjectId: 's1',
            purpose: 'MKT',
            grantedAt: '2026-06-01T00:00:00.000Z',
            reconfirmDays: 365,
          },
        ],
        asOf: '2026-06-17T00:00:00.000Z',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.active).toBe(1);
  });
});
