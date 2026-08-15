import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => async (req: any, ctx: any) => {
    return handler(req, {
      user: { id: 'test-user-123', tenantId: 'dev-tenant' },
      permissions: ['tax-declarations:read', 'tax-declarations:create'],
      roles: ['PAYROLL_ADMIN'],
      ...ctx,
    });
  },
}));

describe('Tax Declarations API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns list of tax declarations', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/v1/tax-declarations?financialYear=2026-2027'
    );
    const res = await GET(req, {});
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('POST creates a new tax declaration', async () => {
    const payload = {
      financialYear: '2026-2027',
      taxRegime: 'OLD',
      ppf: 150000,
      elss: 0,
      lifeInsurance: 25000,
      medicalSelf: 25000,
      medicalParents: 50000,
    };

    const req = new NextRequest('http://localhost:3000/api/v1/tax-declarations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await POST(req, {});
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.taxRegime).toBe('OLD');
    expect(json.data.section80C).toBe(175000);
    expect(json.data.section80D).toBe(75000);
    expect(json.data.totalDeductions).toBe(250000);
  });
});
