// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/payroll-compliance/checks/route';

function makeReq(body: unknown, permissions: string[] = ['payroll:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/payroll-compliance/checks', () => {
  it('403 without permission', async () => {
    const [req, ctx] = makeReq(
      {
        action: 'minWage',
        countryCode: 'AE',
        basicSalary: 1,
        currency: 'AED',
        isNational: true,
      },
      []
    );
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('400 on invalid action', async () => {
    const [req, ctx] = makeReq({ action: 'bogus' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('200 minimum-wage PASS for UAE national above floor', async () => {
    const [req, ctx] = makeReq({
      action: 'minWage',
      countryCode: 'AE',
      basicSalary: 5000,
      currency: 'AED',
      isNational: true,
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('PASS');
  });

  it('200 deduction reconciliation FAIL on multi mismatch', async () => {
    const [req, ctx] = makeReq({
      action: 'reconcileDeductions',
      payslip: [
        { code: 'GOSI', amount: 1000 },
        { code: 'WPS', amount: 10 },
      ],
      remittance: [
        { code: 'GOSI', amount: 900 },
        { code: 'WPS', amount: 15 },
      ],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('FAIL');
  });

  it('200 payslip completeness PASS for full AE payslip', async () => {
    const [req, ctx] = makeReq({
      action: 'payslipCompleteness',
      countryCode: 'AE',
      payslip: {
        employeeId: 'E001',
        employeeName: 'Ahmed',
        employerName: 'Acme',
        payPeriodStart: '2026-06-01',
        payPeriodEnd: '2026-06-30',
        basicSalary: 8000,
        netPay: 7800,
        wpsReference: 'WPS-9001',
      },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('PASS');
  });
});
