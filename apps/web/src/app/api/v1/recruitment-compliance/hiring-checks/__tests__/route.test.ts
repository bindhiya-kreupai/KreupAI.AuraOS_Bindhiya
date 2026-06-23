// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/recruitment-compliance/hiring-checks/route';

function makeReq(body: unknown, permissions: string[] = ['recruitment:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/recruitment-compliance/hiring-checks', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({ action: 'shortlistBias', applicantPool: [], shortlist: [] }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ action: 'wrongAction' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with shortlist bias verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'shortlistBias',
      applicantPool: [
        { candidateId: 'c1', attributes: { gender: 'male' } },
        { candidateId: 'c2', attributes: { gender: 'female' } },
      ],
      shortlist: [
        { candidateId: 'c1', attributes: { gender: 'male' } },
        { candidateId: 'c2', attributes: { gender: 'female' } },
      ],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('PASS');
  });

  it('returns 200 with equal-pay verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'equalPay',
      offerCandidate: { gender: 'female' },
      offerSalary: 9800,
      band: { grade: 'G5', min: 8000, mid: 10000, max: 12000, currency: 'AED' },
      peers: [
        { employeeId: 'e1', grade: 'G5', salary: 10000, gender: 'female' },
        { employeeId: 'e2', grade: 'G5', salary: 9700, gender: 'female' },
      ],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(['PASS', 'WARN', 'FAIL']).toContain(json.data.verdict.outcome);
  });

  it('returns 200 with nationalization gate verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'nationalizationGate',
      currentNationals: 30,
      currentTotal: 100,
      requiredRatio: 0.2,
      candidateIsNational: false,
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('PASS');
  });
});
