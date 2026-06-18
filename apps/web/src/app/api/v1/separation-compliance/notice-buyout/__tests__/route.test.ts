// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/separation-compliance/notice-calculator.service', () => ({
  noticeBuyoutService: {
    employerBuyout: vi.fn(),
    employeeRecovery: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/separation-compliance/notice-buyout/route';
import { noticeBuyoutService } from '@/lib/services/separation-compliance/notice-calculator.service';

const svc = noticeBuyoutService as unknown as any;

function makeReq(body: unknown, permissions: string[] = ['payroll:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/separation-compliance/notice-buyout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input', async () => {
    const [req, ctx] = makeReq({ direction: 'EMPLOYER_BUYOUT' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with employerBuyout result by default', async () => {
    svc.employerBuyout.mockResolvedValue({ amount: 9000, currency: 'AED', formula: 'X' });
    const [req, ctx] = makeReq({
      salary: { basicSalary: 9000, currency: 'AED' },
      noticeRequiredDays: 30,
      noticeServedDays: 0,
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.amount).toBe(9000);
    expect(svc.employerBuyout).toHaveBeenCalled();
    expect(svc.employeeRecovery).not.toHaveBeenCalled();
  });

  it('routes to employeeRecovery when direction=EMPLOYEE_RECOVERY', async () => {
    svc.employeeRecovery.mockResolvedValue({ amount: 4500, currency: 'AED' });
    const [req, ctx] = makeReq({
      direction: 'EMPLOYEE_RECOVERY',
      salary: { basicSalary: 9000, currency: 'AED' },
      noticeRequiredDays: 30,
      noticeServedDays: 15,
      countryCode: 'AE',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.amount).toBe(4500);
    expect(svc.employeeRecovery).toHaveBeenCalledWith(
      expect.objectContaining({
        noticeRequiredDays: 30,
        noticeServedDays: 15,
        countryCode: 'AE',
      })
    );
    expect(svc.employerBuyout).not.toHaveBeenCalled();
  });
});
