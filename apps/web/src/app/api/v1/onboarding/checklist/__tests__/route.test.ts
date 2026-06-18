// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/onboarding-case.service.checklist', () => ({
  buildChecklist: vi.fn(),
  completionSummary: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/onboarding/checklist/route';
import {
  buildChecklist,
  completionSummary,
} from '@/lib/services/onboarding-case.service.checklist';

const buildMock = buildChecklist as unknown as ReturnType<typeof vi.fn>;
const summaryMock = completionSummary as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['employee:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/onboarding/checklist', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on missing joiningDate', async () => {
    const [req, ctx] = makeReq({});
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 + default checklist + summary on valid joiningDate', async () => {
    buildMock.mockReturnValue([{ code: 'OFFER_LETTER', status: 'PENDING' }]);
    summaryMock.mockReturnValue({
      total: 1,
      done: 0,
      pending: 1,
      overdue: 0,
      blockersDone: 0,
      blockersTotal: 1,
      pctComplete: 0,
      pctBlockersComplete: 0,
      canJoin: false,
      byStage: { PRE_JOINING: { done: 0, total: 1 }, JOINING_DAY: { done: 0, total: 0 } },
    });
    const [req, ctx] = makeReq({ joiningDate: '2026-07-01T00:00:00.000Z' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.summary.canJoin).toBe(false);
    expect(buildMock).toHaveBeenCalled();
  });
});
