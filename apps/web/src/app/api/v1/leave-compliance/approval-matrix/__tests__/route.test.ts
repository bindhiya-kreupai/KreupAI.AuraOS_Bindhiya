// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/leave/approval-matrix.service', () => ({
  DEFAULT_APPROVAL_MATRIX: [],
  matchApprovalRule: vi.fn(),
  buildApproverChain: vi.fn(),
  advanceLevel: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/leave-compliance/approval-matrix/route';
import {
  matchApprovalRule,
  buildApproverChain,
  advanceLevel,
} from '@/lib/services/leave/approval-matrix.service';

const matchMock = matchApprovalRule as unknown as ReturnType<typeof vi.fn>;
const chainMock = buildApproverChain as unknown as ReturnType<typeof vi.fn>;
const advanceMock = advanceLevel as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['leave:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/leave-compliance/approval-matrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    matchMock.mockReturnValue({ id: 'R-ANNUAL-DEFAULT' });
    chainMock.mockReturnValue([{ level: 1, role: 'MANAGER', required: true }]);
  });

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({ leaveType: 'ANNUAL', totalDays: 3 }, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input (missing leaveType)', async () => {
    const [req, ctx] = makeReq({ totalDays: 3 });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with rule + chain on buildChain (default action)', async () => {
    const [req, ctx] = makeReq({ leaveType: 'ANNUAL', totalDays: 3, country: 'AE' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.rule.id).toBe('R-ANNUAL-DEFAULT');
    expect(json.data.chain).toHaveLength(1);
  });

  it('returns 200 with only rule on matchRule action', async () => {
    const [req, ctx] = makeReq({ action: 'matchRule', leaveType: 'SICK', totalDays: 2 });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.rule).toBeDefined();
    expect(json.data.chain).toBeUndefined();
  });

  it('returns 200 with advance decision on advanceLevel action', async () => {
    advanceMock.mockReturnValue({ done: false, nextLevel: 2 });
    const [req, ctx] = makeReq({
      action: 'advanceLevel',
      leaveType: 'ANNUAL',
      totalDays: 3,
      currentLevel: 1,
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.advance.nextLevel).toBe(2);
    expect(advanceMock).toHaveBeenCalled();
  });
});
