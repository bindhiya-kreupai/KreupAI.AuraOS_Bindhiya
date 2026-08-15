import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getDashboard } from '../dashboard/route';
import { GET as getPolicies, POST as postPolicy } from '../policies/route';
import { GET as getRateCards, POST as postRateCard } from '../rate-cards/route';
import { GET as getRequests, POST as postRequest } from '../requests/route';
import { GET as getActuals, POST as postActual } from '../actuals/route';
import { GET as getBudgets, POST as postBudget } from '../budgets/route';
import { GET as getCerts, POST as postCert } from '../certificate/route';

// Mock enhanced auth context
vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: (req: NextRequest, ctx: any) => any) => {
    return (req: NextRequest) => {
      const mockCtx = {
        user: { id: 'test-user-id', tenantId: 'test-tenant-id' },
        permissions: ['*'],
        roles: ['ADMIN'],
      };
      return handler(req, mockCtx);
    };
  },
}));

// Mock overtime compliance service layer
vi.mock('@/lib/services/overtime-compliance', () => ({
  otDashboardService: {
    getMetrics: vi.fn().mockResolvedValue({
      period: '2026-07',
      policyCount: 1,
      rateCardCount: 4,
      totalRequests: 1,
      totalActuals: 1,
    }),
  },
  otPolicyService: {
    listPolicies: vi
      .fn()
      .mockResolvedValue([
        { id: 'pol-1', country: 'AE', maxDailyOtHours: '2', maxMonthlyOtHours: '40' },
      ]),
    upsertPolicy: vi.fn().mockResolvedValue({ id: 'pol-1', country: 'AE' }),
  },
  otRateCardService: {
    listRateCards: vi
      .fn()
      .mockResolvedValue([{ id: 'rc-1', country: 'AE', otType: 'WEEKDAY', multiplier: '1.25' }]),
    seedDefaults: vi.fn().mockResolvedValue({ created: 4 }),
  },
  otRequestService: {
    list: vi.fn().mockResolvedValue({
      items: [{ id: 'req-1', employeeId: 'emp-1', plannedHours: 2, status: 'PENDING' }],
      total: 1,
    }),
    create: vi.fn().mockResolvedValue({ id: 'req-1', status: 'PENDING' }),
    approve: vi.fn().mockResolvedValue({ id: 'req-1', status: 'APPROVED' }),
    reject: vi.fn().mockResolvedValue({ id: 'req-1', status: 'REJECTED' }),
  },
  otActualService: {
    list: vi.fn().mockResolvedValue({
      items: [{ id: 'act-1', employeeId: 'emp-1', actualHours: 2, fraudScore: 0 }],
      total: 1,
    }),
    post: vi.fn().mockResolvedValue({ id: 'act-1', actualHours: 2 }),
    postToPayroll: vi.fn().mockResolvedValue({ id: 'act-1', payrollPosted: true }),
  },
  otBudgetService: {
    list: vi
      .fn()
      .mockResolvedValue([
        { id: 'bud-1', period: '2026-07', budgetHours: '100', budgetAmount: '10000' },
      ]),
    upsertBudget: vi.fn().mockResolvedValue({ id: 'bud-1', period: '2026-07' }),
    refreshActuals: vi.fn().mockResolvedValue({ refreshed: true }),
  },
  otCertificateService: {
    list: vi
      .fn()
      .mockResolvedValue([{ id: 'cert-1', period: '2026-07', status: 'DRAFT', exceedsCount: 0 }]),
    generate: vi.fn().mockResolvedValue({ id: 'cert-1', period: '2026-07', status: 'DRAFT' }),
    sign: vi.fn().mockResolvedValue({ id: 'cert-1', period: '2026-07', status: 'SIGNED' }),
  },
}));

describe('overtime-compliance API routes', () => {
  it('GET /dashboard returns aggregated metrics', async () => {
    const req = new NextRequest(
      'http://localhost/api/v1/overtime-compliance/dashboard?period=2026-07'
    );
    const res = await getDashboard(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.policyCount).toBe(1);
  });

  it('GET & POST /policies', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/overtime-compliance/policies');
    const getRes = await getPolicies(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/overtime-compliance/policies', {
      method: 'POST',
      body: JSON.stringify({ country: 'AE', effectiveFrom: '2026-07-22' }),
    });
    const postRes = await postPolicy(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /rate-cards', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/overtime-compliance/rate-cards');
    const getRes = await getRateCards(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/overtime-compliance/rate-cards', {
      method: 'POST',
      body: JSON.stringify({ action: 'seed-defaults' }),
    });
    const postRes = await postRateCard(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /requests', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/overtime-compliance/requests');
    const getRes = await getRequests(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/overtime-compliance/requests', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        employeeId: 'emp-1',
        country: 'AE',
        requestDate: '2026-07-22',
        plannedHours: 2,
        otType: 'WEEKDAY',
      }),
    });
    const postRes = await postRequest(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /actuals', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/overtime-compliance/actuals');
    const getRes = await getActuals(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/overtime-compliance/actuals', {
      method: 'POST',
      body: JSON.stringify({
        action: 'post',
        employeeId: 'emp-1',
        country: 'AE',
        otDate: '2026-07-22',
        otType: 'WEEKDAY',
        actualHours: 2,
      }),
    });
    const postRes = await postActual(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /budgets', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/overtime-compliance/budgets');
    const getRes = await getBudgets(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/overtime-compliance/budgets', {
      method: 'POST',
      body: JSON.stringify({
        action: 'upsert',
        period: '2026-07',
        budgetHours: 100,
        budgetAmount: 10000,
      }),
    });
    const postRes = await postBudget(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /certificate', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/overtime-compliance/certificate');
    const getRes = await getCerts(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/overtime-compliance/certificate', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate', period: '2026-07' }),
    });
    const postRes = await postCert(postReq);
    expect(postRes.status).toBe(200);
  });
});
