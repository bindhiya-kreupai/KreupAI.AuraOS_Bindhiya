// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

vi.mock('@aura/database', () => ({
  prisma: {
    rewardCatalog: { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn() },
    rewardPointLedger: { aggregate: vi.fn(), create: vi.fn() },
    rewardRedemption: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { GET } from '@/app/api/performance/rewards/route';
import { POST as REDEEM } from '@/app/api/performance/rewards/redeem/route';
import { prisma } from '@aura/database';

const db = prisma as unknown as any;

function makeReq(body: unknown, url: string) {
  return [
    { json: async () => body, url } as any,
    { user: { userId: 'u1', employeeId: 'e1', tenantId: 't1' } } as any,
  ] as const;
}

describe('GET /api/performance/rewards', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns tenant-scoped catalog with derived balance', async () => {
    db.rewardCatalog.findMany.mockResolvedValue([{ id: 'r1', name: 'Voucher', cost: 100 }]);
    db.rewardCatalog.count.mockResolvedValue(1);
    db.rewardPointLedger.aggregate.mockResolvedValue({ _sum: { points: 250 } });

    const [req, ctx] = makeReq(undefined, 'http://x/api/performance/rewards');
    const res = await GET(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.items).toHaveLength(1);
    expect(json.balance).toBe(250);
    expect(db.rewardCatalog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 't1', isDeleted: false, isActive: true }),
      })
    );
  });
});

describe('POST /api/performance/rewards/redeem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects redemption when balance is insufficient (409, bilingual)', async () => {
    db.rewardCatalog.findFirst.mockResolvedValue({ id: 'r1', name: 'TV', cost: 1000 });
    db.rewardPointLedger.aggregate.mockResolvedValue({ _sum: { points: 50 } });

    const [req, ctx] = makeReq({ rewardId: 'r1' }, 'http://x/api/performance/rewards/redeem');
    const res = await REDEEM(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error.message).toContain('Insufficient');
    expect(json.error.messageAr).toBeTruthy();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('records redemption + negative ledger entry when affordable', async () => {
    db.rewardCatalog.findFirst.mockResolvedValue({ id: 'r1', name: 'Mug', cost: 100 });
    db.rewardPointLedger.aggregate.mockResolvedValue({ _sum: { points: 300 } });
    db.rewardRedemption.create.mockReturnValue('redemptionOp');
    db.rewardPointLedger.create.mockReturnValue('ledgerOp');
    db.$transaction.mockResolvedValue([{ id: 'red1' }, { id: 'ledger1' }]);

    const [req, ctx] = makeReq({ rewardId: 'r1' }, 'http://x/api/performance/rewards/redeem');
    const res = await REDEEM(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.balance).toBe(200); // 300 - 100
    expect(db.$transaction).toHaveBeenCalledWith(['redemptionOp', 'ledgerOp']);
  });
});
