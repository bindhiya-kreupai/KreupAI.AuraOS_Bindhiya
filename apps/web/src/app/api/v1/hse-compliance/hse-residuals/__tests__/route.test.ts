// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/hse-compliance/hse-residuals/route';

function makeReq(body: unknown, permissions: string[] = ['hse:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/hse-compliance/hse-residuals', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq(
      { action: 'governance', input: { controls: [], evidences: [] } },
      []
    );
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ action: 'governance' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('action=accountability returns verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'accountability',
      input: {
        totalWorkers: 50,
        requiredRatios: { HSE_OFFICER: 50 },
        assignments: [{ role: 'HSE_OFFICER', employeeId: 'e1', certified: true, mandated: true }],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.coveragePct).toBe(100);
  });

  it('action=checklist returns verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'checklist',
      input: {
        items: [{ code: 'A', question: 'PPE OK?', questionAr: '؟', weight: 5, critical: true }],
        responses: [{ code: 'A', pass: true }],
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.pass).toBe(true);
  });

  it('action=cctv returns verdict', async () => {
    const [req, ctx] = makeReq({
      action: 'cctv',
      input: {
        cameras: ['CAM1'],
        checks: [],
        asOf: new Date().toISOString(),
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.failures[0].code).toBe('NEVER_CHECKED');
  });
});
