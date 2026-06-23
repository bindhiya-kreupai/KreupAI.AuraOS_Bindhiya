// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/expense-compliance/checks/route';

function makeReq(body: unknown, permissions: string[] = ['expenses:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/expense-compliance/checks', () => {
  it('403 without permission', async () => {
    const [req, ctx] = makeReq({ action: 'duplicateReceipts', receipts: [] }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('400 on invalid action', async () => {
    const [req, ctx] = makeReq({ action: 'bogus' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('200 with exception cadence verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'exceptionCadence',
      exceptionId: 'e1',
      raisedAt: '2026-06-01',
      slaDays: 10,
      asOf: '2026-06-07',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('WARN');
  });

  it('200 with duplicate receipts verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'duplicateReceipts',
      receipts: [
        {
          receiptId: 'r1',
          employeeId: 'e1',
          vendor: 'X',
          date: '2026-06-01',
          amount: 100,
          currency: 'AED',
        },
        {
          receiptId: 'r2',
          employeeId: 'e1',
          vendor: 'X',
          date: '2026-06-01',
          amount: 100,
          currency: 'AED',
        },
      ],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('WARN');
  });

  it('200 with per-diem verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'perDiemCap',
      claim: { countryCode: 'AE', cityTier: 'TIER_1', daysClaimed: 2, totalClaimedAmount: 1000 },
      policy: {
        countryCode: 'AE',
        currency: 'AED',
        capsByTier: { TIER_1: 600, TIER_2: 400, TIER_3: 250 },
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('PASS');
  });
});
