// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({ withEnhancedAuth: (h: any) => h }));

import { POST } from '@/app/api/v1/workforce-planning/governance/route';

function makeReq(body: unknown, permissions: string[] = ['workforce_planning:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/workforce-planning/governance', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({ controls: [], evidences: [] }, []);
    expect((await POST(req, ctx)).status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ controls: [{ code: 'X' }], evidences: [] });
    expect((await POST(req, ctx)).status).toBe(400);
  });

  it('returns 200 with verdict on valid input', async () => {
    const [req, ctx] = makeReq({
      controls: [
        {
          code: 'WP_REVIEW',
          label: 'Quarterly review',
          domain: 'WP',
          requiredRoles: ['CHRO'],
          cadenceDays: 90,
          evidenceType: 'SIGNED_MINUTE',
        },
      ],
      evidences: [
        {
          controlCode: 'WP_REVIEW',
          evidencedAt: new Date().toISOString(),
          evidencedBy: 'u1',
        },
      ],
      asOf: new Date().toISOString(),
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.totals.controls).toBe(1);
    expect(json.data.verdict.totals.overdue).toBe(0);
  });
});
