// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/executive-compliance/drill-down.service', () => ({
  buildRiskHeatmap: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { GET } from '@/app/api/v1/compliance-dashboard/risk-heatmap/route';
import { buildRiskHeatmap } from '@/lib/services/executive-compliance/drill-down.service';
import { prisma } from '@aura/database';

const buildMock = buildRiskHeatmap as unknown as ReturnType<typeof vi.fn>;
const findManyMock = (prisma as any).redFlagInstance?.findMany as ReturnType<typeof vi.fn>;

// The global setup mock does not include redFlagInstance — install it.
beforeEach(() => {
  if (!(prisma as any).redFlagInstance) {
    (prisma as any).redFlagInstance = { findMany: vi.fn() };
  }
});

function makeReq(
  query: Record<string, string> = {},
  permissions: string[] = ['compliance_kpi:read']
) {
  const usp = new URLSearchParams(query);
  return [
    { json: async () => ({}), url: `http://x/api?${usp.toString()}` } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('GET /api/v1/compliance-dashboard/risk-heatmap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!(prisma as any).redFlagInstance) {
      (prisma as any).redFlagInstance = { findMany: vi.fn() };
    }
  });

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await GET(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 200 + heatmap totals', async () => {
    (prisma as any).redFlagInstance.findMany = vi.fn().mockResolvedValue([
      {
        id: 'r1',
        domain: 'PAYROLL',
        severity: 'HIGH',
        status: 'OPEN',
        ruleCode: 'X1',
        raisedAt: new Date(),
        details: { countryCode: 'AE' },
      },
      {
        id: 'r2',
        domain: 'EOSB',
        severity: 'MEDIUM',
        status: 'OPEN',
        ruleCode: 'X2',
        raisedAt: new Date(),
        details: { countryCode: 'SA' },
      },
    ]);
    buildMock.mockReturnValue([
      { domain: 'PAYROLL', country: 'AE', count: 1 },
      { domain: 'EOSB', country: 'SA', count: 1 },
    ]);
    const [req, ctx] = makeReq();
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.cells).toHaveLength(2);
    expect(json.data.totals.cells).toBe(2);
    expect(json.data.totals.flagsInScope).toBe(2);
    expect(json.data.totals.domains).toBe(2);
    expect(json.data.totals.countries).toBe(2);
  });

  it('applies country filter before building heatmap', async () => {
    (prisma as any).redFlagInstance.findMany = vi.fn().mockResolvedValue([
      {
        id: 'r1',
        domain: 'PAYROLL',
        severity: 'HIGH',
        status: 'OPEN',
        ruleCode: 'X1',
        raisedAt: new Date(),
        details: { countryCode: 'AE' },
      },
      {
        id: 'r2',
        domain: 'EOSB',
        severity: 'MEDIUM',
        status: 'OPEN',
        ruleCode: 'X2',
        raisedAt: new Date(),
        details: { countryCode: 'SA' },
      },
    ]);
    buildMock.mockReturnValue([{ domain: 'PAYROLL', country: 'AE', count: 1 }]);
    const [req, ctx] = makeReq({ country: 'AE' });
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.totals.flagsInScope).toBe(1); // SA flag dropped
    // buildRiskHeatmap should have been called with only the AE snapshot
    const arg = buildMock.mock.calls[0][0] as any[];
    expect(arg).toHaveLength(1);
    expect(arg[0].countryCode).toBe('AE');
  });
});
