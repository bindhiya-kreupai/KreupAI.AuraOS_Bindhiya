// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/benefits-compliance/eligibility.service', () => ({
  benefitEligibilityService: {
    evaluate: vi.fn(),
    evaluateAllForEmployee: vi.fn(),
    findMandatoryGaps: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/benefits-compliance/eligibility/route';
import { benefitEligibilityService } from '@/lib/services/benefits-compliance/eligibility.service';

const svc = benefitEligibilityService as unknown as any;

function makeReq(body: unknown, permissions: string[] = ['benefits:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/benefits-compliance/eligibility', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid action', async () => {
    const [req, ctx] = makeReq({ action: 'bogus' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 400 when evaluate missing benefitCode', async () => {
    const [req, ctx] = makeReq({
      action: 'evaluate',
      context: { employee: { id: 'e1' } },
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 + verdict on evaluate', async () => {
    svc.evaluate.mockResolvedValue({ eligible: true, reason: 'Active employee' });
    const [req, ctx] = makeReq({
      action: 'evaluate',
      benefitCode: 'MEDICAL_INSURANCE_UAE',
      context: { employee: { id: 'e1', countryCode: 'AE' } },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.eligible).toBe(true);
    expect(svc.evaluate).toHaveBeenCalledWith(
      't1',
      'MEDICAL_INSURANCE_UAE',
      expect.objectContaining({ employee: expect.objectContaining({ id: 'e1' }) }),
      expect.any(Date)
    );
  });

  it('returns 200 + totals on evaluateAll', async () => {
    svc.evaluateAllForEmployee.mockResolvedValue([
      { eligible: true, benefitCode: 'A' },
      { eligible: false, benefitCode: 'B' },
    ]);
    const [req, ctx] = makeReq({
      action: 'evaluateAll',
      context: { employee: { id: 'e1' } },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdicts).toHaveLength(2);
    expect(json.data.totals).toEqual({ checked: 2, eligible: 1, ineligible: 1 });
  });

  it('returns 200 on findMandatoryGaps', async () => {
    svc.findMandatoryGaps.mockResolvedValue({
      uncovered: [{ code: 'X' }],
      coveredButIneligible: [],
    });
    const [req, ctx] = makeReq({
      action: 'findMandatoryGaps',
      employeeId: 'e1',
      context: { employee: { id: 'e1' } },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.uncovered).toHaveLength(1);
    expect(svc.findMandatoryGaps).toHaveBeenCalledWith(
      't1',
      'e1',
      expect.any(Object),
      expect.any(Date)
    );
  });
});
