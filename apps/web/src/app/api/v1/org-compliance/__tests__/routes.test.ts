import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getDashboard } from '../dashboard/route';
import { GET as getChecklist, POST as postChecklist } from '../audit-checklist/route';
import { GET as getCerts, POST as postCert } from '../certificate/route';
import { GET as getPositions, POST as postPosition } from '../position-control/route';
import { GET as getVacancies, POST as postVacancy } from '../vacancy/route';

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

// Mock org compliance service layer
vi.mock('@/lib/services/org-compliance', () => ({
  orgComplianceDashboardService: {
    getMetrics: vi.fn().mockResolvedValue({
      period: '2026-07',
      failingChecklistItems: 0,
      totalOverhire: 0,
      unapprovedVacancies90d: 0,
      activeCertificateStatus: 'DRAFT',
    }),
  },
  orgAuditChecklistService: {
    list: vi.fn().mockResolvedValue({
      items: [{ id: 'chk-1', itemCode: 'PC-01', label: 'Position control check', result: 'PASS' }],
      total: 1,
    }),
    upsert: vi.fn().mockResolvedValue({ id: 'chk-1', itemCode: 'PC-01' }),
    record: vi.fn().mockResolvedValue({ id: 'chk-1', result: 'PASS' }),
  },
  orgPositionControlService: {
    list: vi.fn().mockResolvedValue({
      items: [
        {
          id: 'pos-1',
          period: '2026-07',
          budgetedHeadcount: 10,
          approvedHeadcount: 10,
          filledHeadcount: 8,
        },
      ],
      total: 1,
    }),
    upsert: vi.fn().mockResolvedValue({ id: 'pos-1', period: '2026-07' }),
  },
  orgVacancyService: {
    list: vi.fn().mockResolvedValue({
      items: [{ id: 'vac-1', vacancyNumber: 'VAC-101', status: 'OPEN' }],
      total: 1,
    }),
    raise: vi.fn().mockResolvedValue({ id: 'vac-1', vacancyNumber: 'VAC-101', status: 'OPEN' }),
    approve: vi.fn().mockResolvedValue({ id: 'vac-1', status: 'APPROVED' }),
    fill: vi.fn().mockResolvedValue({ id: 'vac-1', status: 'FILLED' }),
  },
  orgComplianceCertificateService: {
    list: vi
      .fn()
      .mockResolvedValue([
        { id: 'cert-1', period: '2026-07', status: 'DRAFT', checklistFailing: 0 },
      ]),
    generate: vi.fn().mockResolvedValue({ id: 'cert-1', period: '2026-07', status: 'DRAFT' }),
    sign: vi.fn().mockResolvedValue({ id: 'cert-1', period: '2026-07', status: 'SIGNED' }),
  },
}));

describe('org-compliance API routes', () => {
  it('GET /dashboard returns aggregated org metrics', async () => {
    const req = new NextRequest('http://localhost/api/v1/org-compliance/dashboard?period=2026-07');
    const res = await getDashboard(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.failingChecklistItems).toBe(0);
  });

  it('GET & POST /audit-checklist', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/org-compliance/audit-checklist');
    const getRes = await getChecklist(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/org-compliance/audit-checklist', {
      method: 'POST',
      body: JSON.stringify({
        action: 'upsert',
        itemCode: 'PC-01',
        label: 'Position control check',
        category: 'POSITION',
      }),
    });
    const postRes = await postChecklist(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /position-control', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/org-compliance/position-control');
    const getRes = await getPositions(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/org-compliance/position-control', {
      method: 'POST',
      body: JSON.stringify({
        action: 'upsert',
        period: '2026-07',
        budgetedHeadcount: 10,
        approvedHeadcount: 10,
        filledHeadcount: 8,
      }),
    });
    const postRes = await postPosition(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /vacancy', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/org-compliance/vacancy');
    const getRes = await getVacancies(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/org-compliance/vacancy', {
      method: 'POST',
      body: JSON.stringify({
        action: 'raise',
        vacancyNumber: 'VAC-101',
      }),
    });
    const postRes = await postVacancy(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /certificate', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/org-compliance/certificate');
    const getRes = await getCerts(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/org-compliance/certificate', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate', period: '2026-07' }),
    });
    const postRes = await postCert(postReq);
    expect(postRes.status).toBe(200);
  });
});
