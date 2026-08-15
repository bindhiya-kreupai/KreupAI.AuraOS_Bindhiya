import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getDashboard } from '../dashboard/route';
import { GET as getGovernance, POST as postGovernance } from '../governance/route';
import { GET as getFindings, POST as postFinding } from '../audit-finding/route';
import { GET as getRisks, POST as postRisk } from '../risk-register/route';
import { GET as getCerts, POST as postCert } from '../certificate/route';
import { POST as postPeriodLock } from '../period-lock/route';

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

describe('payroll-compliance API routes', () => {
  it('GET /dashboard returns aggregated metrics', async () => {
    const req = new NextRequest(
      'http://localhost/api/v1/payroll-compliance/dashboard?period=2026-07'
    );
    const res = await getDashboard(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('GET & POST /governance', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/payroll-compliance/governance');
    const getRes = await getGovernance(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/payroll-compliance/governance', {
      method: 'POST',
      body: JSON.stringify({
        action: 'upsert',
        controlCode: 'GOV-01',
        label: 'Pre-run Approval Gate',
        category: 'APPROVAL',
      }),
    });
    const postRes = await postGovernance(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /audit-finding', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/payroll-compliance/audit-finding');
    const getRes = await getFindings(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/payroll-compliance/audit-finding', {
      method: 'POST',
      body: JSON.stringify({
        action: 'raise',
        findingNumber: 'AUD-01',
        period: '2026-07',
        category: 'APPROVAL',
        title: 'Unapproved Payroll Run',
      }),
    });
    const postRes = await postFinding(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /risk-register', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/payroll-compliance/risk-register');
    const getRes = await getRisks(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/payroll-compliance/risk-register', {
      method: 'POST',
      body: JSON.stringify({
        action: 'upsert',
        riskCode: 'RSK-01',
        title: 'Late WPS File Submission',
        category: 'STATUTORY',
        likelihood: 3,
        impact: 4,
      }),
    });
    const postRes = await postRisk(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /certificate', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/payroll-compliance/certificate');
    const getRes = await getCerts(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/payroll-compliance/certificate', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate', period: '2026-07' }),
    });
    const postRes = await postCert(postReq);
    expect(postRes.status).toBe(200);
  });

  it('POST /period-lock evaluates change against period', async () => {
    const postReq = new NextRequest('http://localhost/api/v1/payroll-compliance/period-lock', {
      method: 'POST',
      body: JSON.stringify({
        changeType: 'SALARY_CHANGE',
        period: {
          period: '2026-07',
          cutOffDate: '2026-07-25',
        },
        appliedAt: '2026-07-20',
      }),
    });
    const postRes = await postPeriodLock(postReq);
    expect(postRes.status).toBe(200);
  });
});
