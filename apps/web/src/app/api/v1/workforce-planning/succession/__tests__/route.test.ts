// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({ withEnhancedAuth: (h: any) => h }));

import { POST } from '@/app/api/v1/workforce-planning/succession/route';

function makeReq(body: unknown, permissions: string[] = ['workforce_planning:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/workforce-planning/succession', () => {
  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({ roles: [] }, []);
    expect((await POST(req, ctx)).status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ roles: [{ role: 'CEO', successors: [{ readiness: 'BAD' }] }] });
    expect((await POST(req, ctx)).status).toBe(400);
  });

  it('returns 200 with heatmap on valid input', async () => {
    const [req, ctx] = makeReq({
      roles: [
        {
          role: 'CFO',
          successors: [{ employeeId: 'e1', readiness: 'READY_NOW' }],
        },
        { role: 'COO', successors: [] },
      ],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.cells).toHaveLength(2);
    expect(json.data.verdict.totals.coveragePct).toBe(50);
  });
});
