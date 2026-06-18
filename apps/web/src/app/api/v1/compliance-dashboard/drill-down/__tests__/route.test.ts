// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/executive-compliance/drill-down.service', () => ({
  aggregateFlagsByCountryEntity: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { GET } from '@/app/api/v1/compliance-dashboard/drill-down/route';
import { aggregateFlagsByCountryEntity } from '@/lib/services/executive-compliance/drill-down.service';
import { prisma } from '@aura/database';

const aggMock = aggregateFlagsByCountryEntity as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
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

describe('GET /api/v1/compliance-dashboard/drill-down', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await GET(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 200 + aggregated drill tree on default status filter', async () => {
    (prisma as any).redFlagInstance.findMany = vi.fn().mockResolvedValue([
      {
        id: 'r1',
        domain: 'PAYROLL',
        severity: 'HIGH',
        status: 'OPEN',
        ruleCode: 'X1',
        raisedAt: new Date(),
        details: { countryCode: 'AE', legalEntityId: 'le1', departmentId: 'd1' },
      },
    ]);
    aggMock.mockReturnValue({
      label: 'Global',
      level: 'GLOBAL',
      flagCount: 1,
      riskScore: 80,
      children: [],
    });
    const [req, ctx] = makeReq();
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.label).toBe('Global');
    // The findMany call should default to OPEN/IN_PROGRESS when no status given.
    const findManyArgs = (prisma as any).redFlagInstance.findMany.mock.calls[0][0];
    expect(findManyArgs.where.status).toEqual({ in: ['OPEN', 'IN_PROGRESS'] });
    expect(findManyArgs.where.tenantId).toBe('t1');
  });

  it('passes through explicit status filter to prisma', async () => {
    (prisma as any).redFlagInstance.findMany = vi.fn().mockResolvedValue([]);
    aggMock.mockReturnValue({ label: 'Global', level: 'GLOBAL', flagCount: 0, riskScore: 0 });
    const [req, ctx] = makeReq({ status: 'RESOLVED' });
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);
    const args = (prisma as any).redFlagInstance.findMany.mock.calls[0][0];
    expect(args.where.status).toBe('RESOLVED');
  });
});
