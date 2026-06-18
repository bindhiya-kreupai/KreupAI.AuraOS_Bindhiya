// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/workforce-planning/scenario/route';

function makeReq(body: unknown, permissions: string[] = ['workforce_planning:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/workforce-planning/scenario', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({ assumptions: {} }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({});
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with verdict on valid input', async () => {
    const [req, ctx] = makeReq({
      assumptions: {
        startingHeadcount: 100,
        monthlyCostPerRole: { ENG: 10000 },
        annualGrowthPctPerRole: { ENG: 0.1 },
        annualAttritionPctPerRole: { ENG: 0.05 },
        horizonMonths: 6,
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.horizonMonths).toBe(6);
    expect(json.data.verdict.steps).toHaveLength(6);
  });
});
