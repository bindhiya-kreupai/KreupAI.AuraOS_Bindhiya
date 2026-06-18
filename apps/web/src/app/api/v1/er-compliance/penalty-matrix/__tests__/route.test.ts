// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/er-compliance/penalty-matrix.service', () => ({
  penaltyMatrixService: {
    recommend: vi.fn(),
    findInconsistentPrecedents: vi.fn(),
  },
  MISCONDUCT_TYPES: [
    'THEFT',
    'VIOLENCE',
    'FRAUD',
    'DRUGS_ALCOHOL',
    'SAFETY_VIOLATION',
    'ABSENTEEISM',
    'INSUBORDINATION',
    'POLICY_VIOLATION',
  ] as const,
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/er-compliance/penalty-matrix/route';
import { penaltyMatrixService } from '@/lib/services/er-compliance/penalty-matrix.service';

const p = penaltyMatrixService as unknown as any;

function makeReq(body: unknown, permissions: string[] = ['risk_register:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/er-compliance/penalty-matrix', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input (missing action)', async () => {
    const [req, ctx] = makeReq({});
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 400 when "recommend" missing required fields', async () => {
    const [req, ctx] = makeReq({ action: 'recommend' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 + recommendation on valid recommend input', async () => {
    p.recommend.mockResolvedValue({ recommendedAction: 'WRITTEN_WARNING' });
    const [req, ctx] = makeReq({
      action: 'recommend',
      employeeId: 'e1',
      misconductType: 'INSUBORDINATION',
      severity: 'HIGH',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.recommendation.recommendedAction).toBe('WRITTEN_WARNING');
    expect(p.recommend).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({
        employeeId: 'e1',
        misconductType: 'INSUBORDINATION',
        severity: 'HIGH',
      })
    );
  });

  it('returns 200 + precedents on findInconsistentPrecedents action', async () => {
    p.findInconsistentPrecedents.mockResolvedValue([
      { caseId: 'c1', action: 'TERMINATION' },
      { caseId: 'c2', action: 'WRITTEN_WARNING' },
    ]);
    const [req, ctx] = makeReq({
      action: 'findInconsistentPrecedents',
      misconductType: 'INSUBORDINATION',
      recommended: 'WRITTEN_WARNING',
      lookbackMonths: 12,
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.precedents).toHaveLength(2);
    expect(json.data.count).toBe(2);
    expect(p.findInconsistentPrecedents).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ misconductType: 'INSUBORDINATION', lookbackMonths: 12 })
    );
  });
});
