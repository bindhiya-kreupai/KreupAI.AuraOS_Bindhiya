// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/payroll/period-lock.service', () => ({
  evaluateChangeAgainstPeriod: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/payroll-compliance/period-lock/route';
import { evaluateChangeAgainstPeriod } from '@/lib/services/payroll/period-lock.service';

const evalMock = evaluateChangeAgainstPeriod as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['payroll:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/payroll-compliance/period-lock', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ changeType: 'NOPE' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 + verdict on valid input', async () => {
    evalMock.mockReturnValue({ allow: true, periodStatus: 'OPEN' });
    const [req, ctx] = makeReq({
      changeType: 'SALARY_CHANGE',
      period: {
        period: '2026-05',
        cutOffDate: '2026-05-25T00:00:00.000Z',
      },
      actorRole: 'HR_MANAGER',
      hasJustification: true,
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.allow).toBe(true);
    expect(evalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        changeType: 'SALARY_CHANGE',
        actorRole: 'HR_MANAGER',
        hasJustification: true,
        period: expect.objectContaining({
          period: '2026-05',
          cutOffDate: expect.any(Date),
        }),
      })
    );
  });
});
