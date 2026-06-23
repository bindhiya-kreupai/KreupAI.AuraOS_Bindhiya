// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/emiratisation-compliance/fake-risk-clustering.service', () => ({
  DEFAULT_CLUSTERING_CONFIG: {},
  profileHireRisk: vi.fn(),
  profileCohort: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/emiratisation-compliance/fake-risk/route';
import {
  profileHireRisk,
  profileCohort,
} from '@/lib/services/emiratisation-compliance/fake-risk-clustering.service';

const hireMock = profileHireRisk as unknown as ReturnType<typeof vi.fn>;
const cohortMock = profileCohort as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['risk_register:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/emiratisation-compliance/fake-risk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 when profileHire is missing required hire object', async () => {
    const [req, ctx] = makeReq({ action: 'profileHire', cohort: [] });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 on profileHire action', async () => {
    hireMock.mockReturnValue({
      employeeId: 'e1',
      riskScore: 30,
      riskBand: 'LOW',
      signals: [],
      cluster: { sameDaySameRecruiter: 0, sameDaySameCostCenter: 0 },
    });
    const [req, ctx] = makeReq({
      action: 'profileHire',
      hire: { employeeId: 'e1', basicSalary: 4000 },
      cohort: [],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.result.riskBand).toBe('LOW');
    expect(hireMock).toHaveBeenCalled();
  });

  it('returns 200 on profileCohort action', async () => {
    cohortMock.mockReturnValue([
      { employeeId: 'e1', riskScore: 10, riskBand: 'LOW', signals: [], cluster: {} },
    ]);
    const [req, ctx] = makeReq({
      action: 'profileCohort',
      cohort: [{ employeeId: 'e1', basicSalary: 4000 }],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.result).toHaveLength(1);
    expect(json.data.total).toBe(1);
  });
});
