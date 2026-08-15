import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => async (req: any, ctx: any) => {
    return handler(req, {
      user: { id: 'test-user-123', tenantId: 'dev-tenant' },
      permissions: ['gl:read', 'gl:create', 'gl:post', 'gl:export', 'gl:reverse'],
      roles: ['FINANCE_DIRECTOR'],
      ...ctx,
    });
  },
}));

describe('GL Entries API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns list of GL journal entries', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/gl/entries?status=POSTED');
    const res = await GET(req, {});
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('POST creates a new balanced GL journal entry draft', async () => {
    const payload = {
      countryCode: 'UAE',
      currency: 'AED',
      reference: 'JV-TEST-101',
      description: 'Test Payroll Disbursal Journal',
      sourceType: 'PAYROLL_RUN',
      sourceId: 'pay_run_test_1',
      lines: [
        { accountId: 'ACC-5001', debit: 5000, credit: 0 },
        { accountId: 'ACC-2001', debit: 0, credit: 5000 },
      ],
    };

    const req = new NextRequest('http://localhost:3000/api/v1/gl/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await POST(req, {});
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.status).toBe('DRAFT');
    expect(json.data.totalDebit).toBe(5000);
    expect(json.data.totalCredit).toBe(5000);
  });
});
