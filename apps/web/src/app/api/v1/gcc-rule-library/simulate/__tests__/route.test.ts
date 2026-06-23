// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/gcc-rule-library/rule-simulation.service', () => ({
  ruleSimulationService: {
    simulate: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/gcc-rule-library/simulate/route';
import { ruleSimulationService } from '@/lib/services/gcc-rule-library/rule-simulation.service';

const svc = ruleSimulationService as unknown as any;

function makeReq(body: unknown, permissions: string[] = ['rule_library:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/gcc-rule-library/simulate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 when overrides array is empty', async () => {
    const [req, ctx] = makeReq({ countryCode: 'AE', proposedOverrides: [] });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 400 on missing countryCode', async () => {
    const [req, ctx] = makeReq({
      proposedOverrides: [{ domain: 'GOSI', ruleKey: 'EMPLOYER_RATE', value: 0.115 }],
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 + simulation result on valid input', async () => {
    svc.simulate.mockResolvedValue({
      countryCode: 'AE',
      totals: { sampled: 100, differing: 12, netNumericDelta: 250.5 },
    });
    const [req, ctx] = makeReq({
      countryCode: 'AE',
      proposedOverrides: [
        { domain: 'GOSI', ruleKey: 'EMPLOYER_RATE', value: 0.115 },
        { domain: 'EOSB', ruleKey: 'CAP_MONTHS', value: 24 },
      ],
      scope: { sampleSize: 100 },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.result.totals.differing).toBe(12);
    expect(svc.simulate).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: 'AE',
        proposedOverrides: expect.arrayContaining([
          expect.objectContaining({ domain: 'GOSI', ruleKey: 'EMPLOYER_RATE' }),
        ]),
        scope: expect.objectContaining({ sampleSize: 100 }),
      })
    );
  });
});
