// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

vi.mock('@/lib/services/accommodation-compliance/welfare-ops.service', async () => {
  const actual = await vi.importActual<any>(
    '@/lib/services/accommodation-compliance/welfare-ops.service'
  );
  return {
    ...actual,
    welfareGrievanceMakerCheckerService: {
      submit: vi.fn(async (input: any, auth: any) => ({
        grievanceId: input.grievanceId,
        status: 'SUBMITTED',
        submittedBy: auth.userId,
        submittedAt: new Date(),
        details: input.details,
        category: input.category,
      })),
      approve: vi.fn(async (id: string, auth: any) => ({
        grievanceId: id,
        status: 'APPROVED',
        reviewedBy: auth.userId,
      })),
      reject: vi.fn(async (id: string, reason: string, auth: any) => ({
        grievanceId: id,
        status: 'REJECTED',
        rejectedBy: auth.userId,
        rejectionReason: reason,
      })),
    },
  };
});

import { POST } from '@/app/api/v1/accommodation-compliance/welfare-ops/route';

function makeReq(
  body: unknown,
  permissions: string[] = ['accommodation:read', 'accommodation:write']
) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/accommodation-compliance/welfare-ops', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({ action: 'water', input: { tests: [] } }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ action: 'water' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('action=water returns verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'water',
      input: { tests: [], asOf: new Date().toISOString() },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.failures.length).toBe(5);
  });

  it('action=parity returns verdict', async () => {
    const principal = {
      label: 'P',
      occupants: 10,
      floorAreaM2: 100,
      hygieneScore: 80,
      fireScore: 90,
      acProvided: true,
      messProvided: true,
    };
    const [req, ctx] = makeReq({
      action: 'parity',
      input: { principal, contractors: [{ ...principal, label: 'C' }] },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.parityPct).toBe(100);
  });

  it('action=grievance.submit returns state', async () => {
    const [req, ctx] = makeReq({
      action: 'grievance.submit',
      grievanceId: 'g1',
      details: 'Sewage backup three days running',
      category: 'HYGIENE',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.state.status).toBe('SUBMITTED');
  });

  it('action=grievance.approve returns APPROVED state', async () => {
    const [req, ctx] = makeReq({ action: 'grievance.approve', grievanceId: 'g1' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.state.status).toBe('APPROVED');
  });

  it('action=grievance.reject returns REJECTED state', async () => {
    const [req, ctx] = makeReq({
      action: 'grievance.reject',
      grievanceId: 'g1',
      reason: 'already resolved',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.state.status).toBe('REJECTED');
  });
});
