// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/nitaqat-compliance/three-way-reconciliation.service', () => ({
  reconcileThreeWay: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/nitaqat-compliance/three-way-recon/route';
import { reconcileThreeWay } from '@/lib/services/nitaqat-compliance/three-way-reconciliation.service';

const reconMock = reconcileThreeWay as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['tenant:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/nitaqat-compliance/three-way-recon', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on missing arrays', async () => {
    const [req, ctx] = makeReq({ qiwa: 'not-array' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with reconciliation result', async () => {
    reconMock.mockReturnValue({
      totals: {
        discrepancies: 0,
        qiwa: 0,
        gosi: 0,
        mudad: 0,
        qiwaOnly: 0,
        qiwaGosiNotMudad: 0,
        qiwaMudadNotGosi: 0,
        gosiMudadNotQiwa: 0,
        wageMismatch: 0,
      },
    });
    const [req, ctx] = makeReq({
      qiwa: [{ nationalId: '1', declaredWageSar: 5000, status: 'ACTIVE' }],
      gosi: [{ nationalId: '1', contributionWageSar: 5000, status: 'ACTIVE' }],
      mudad: [{ nationalId: '1', paidWageSar: 5000, paidThisPeriod: true }],
      wageToleranceSar: 100,
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.result.totals.discrepancies).toBe(0);
    expect(reconMock).toHaveBeenCalledWith(expect.objectContaining({ wageToleranceSar: 100 }));
  });
});
