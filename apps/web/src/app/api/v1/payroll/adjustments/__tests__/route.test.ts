import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => async (req: any, ctx: any) =>
    handler(req, {
      ...ctx,
      user: { id: 'dev-user', tenantId: 'dev-tenant' },
      permissions: ['*'],
      roles: ['SUPER_ADMIN'],
    }),
}));

describe('Payroll Adjustments API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns list of payroll adjustments', async () => {
    const req = new NextRequest(
      'http://localhost:3006/api/v1/payroll/adjustments?payrollMonth=2026-08'
    );
    const res = await GET(req, {} as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('POST creates a new payroll adjustment', async () => {
    const req = new NextRequest('http://localhost:3006/api/v1/payroll/adjustments', {
      method: 'POST',
      body: JSON.stringify({
        tenantId: 'dev-tenant',
        employeeId: 'EMP001',
        payrollMonth: '2026-08',
        adjustmentType: 'EARNING',
        code: 'PERF_BONUS',
        name: 'Spot Bonus Award',
        amount: 1000,
        reason: 'Outstanding contribution to Q2 delivery',
        category: 'BONUS',
        createdBy: 'dev-user',
      }),
    });

    const res = await POST(req, {} as any);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.approvalStatus).toBe('PENDING');
  });
});
