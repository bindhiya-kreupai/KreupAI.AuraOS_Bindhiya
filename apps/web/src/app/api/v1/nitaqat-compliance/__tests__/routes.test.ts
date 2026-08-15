import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getDashboard } from '../dashboard/route';
import { GET as getThresholds, POST as postThresholds } from '../thresholds/route';
import { GET as getConfigs, POST as postConfig } from '../config/route';
import { GET as getHires, POST as postHire } from '../hires/route';
import { GET as getSnapshots, POST as postSnapshot } from '../snapshots/route';
import { GET as getCerts, POST as postCert } from '../certificate/route';
import { POST as postPrivilegeCheck } from '../privilege-check/route';

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

// Mock nitaqat compliance service layer
vi.mock('@/lib/services/nitaqat-compliance', () => ({
  nitaqatConfigService: {
    getDashboardMetrics: vi.fn().mockResolvedValue({
      period: '2026-07',
      entitiesInScope: 1,
      platinum: 1,
      green: 0,
      yellow: 0,
      red: 0,
    }),
    listThresholds: vi.fn().mockResolvedValue([
      {
        id: 't-1',
        sector: 'GENERAL',
        sizeBracket: 'SMALL',
        redMaxPct: '10',
        yellowMaxPct: '20',
        greenMaxPct: '30',
        platinumMinPct: '30.01',
      },
    ]),
    seedDefaultThresholds: vi.fn().mockResolvedValue({ seeded: true, count: 5 }),
    listConfigs: vi.fn().mockResolvedValue([
      {
        id: 'c-1',
        establishmentName: 'Test Est',
        sector: 'GENERAL',
        sizeBracket: 'SMALL',
        saudiHeadcount: 10,
        totalHeadcount: 20,
        saudizationPct: '50.00',
        isInScope: true,
      },
    ]),
    upsertConfig: vi.fn().mockResolvedValue({
      id: 'c-1',
      establishmentName: 'Test Est',
      sector: 'GENERAL',
      sizeBracket: 'SMALL',
      saudiHeadcount: 10,
      totalHeadcount: 20,
    }),
    checkPrivilege: vi.fn().mockResolvedValue({
      allowed: true,
      band: 'PLATINUM',
      reason: 'Privilege permitted for PLATINUM band',
    }),
  },
  nitaqatHireService: {
    list: vi.fn().mockResolvedValue({
      items: [
        {
          id: 'h-1',
          employeeId: 'emp-101',
          isSaudi: true,
          gosiRegistered: true,
          mudadCovered: true,
        },
      ],
      total: 1,
    }),
    record: vi.fn().mockResolvedValue({
      id: 'h-1',
      employeeId: 'emp-101',
      isSaudi: true,
    }),
    linkEvidence: vi.fn().mockResolvedValue({
      id: 'h-1',
      employeeId: 'emp-101',
      gosiRegistered: true,
    }),
  },
  nitaqatBandSnapshotService: {
    list: vi.fn().mockResolvedValue({
      items: [
        {
          id: 's-1',
          snapshotDate: '2026-07-21',
          saudizationPct: '50.00',
          band: 'PLATINUM',
        },
      ],
      total: 1,
    }),
    takeSnapshot: vi.fn().mockResolvedValue({
      id: 's-1',
      snapshotDate: '2026-07-21',
      band: 'PLATINUM',
    }),
  },
  nitaqatCertificateService: {
    list: vi.fn().mockResolvedValue([
      {
        id: 'cert-1',
        period: '2026-07',
        status: 'DRAFT',
        entitiesInScope: 1,
        platinumCount: 1,
      },
    ]),
    generate: vi.fn().mockResolvedValue({
      id: 'cert-1',
      period: '2026-07',
      status: 'DRAFT',
    }),
    sign: vi.fn().mockResolvedValue({
      id: 'cert-1',
      period: '2026-07',
      status: 'SIGNED',
    }),
  },
}));

describe('nitaqat-compliance API routes', () => {
  it('GET /dashboard returns aggregated metrics', async () => {
    const req = new NextRequest(
      'http://localhost/api/v1/nitaqat-compliance/dashboard?period=2026-07'
    );
    const res = await getDashboard(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.platinum).toBe(1);
  });

  it('GET & POST /thresholds', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/thresholds');
    const getRes = await getThresholds(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/thresholds', {
      method: 'POST',
      body: JSON.stringify({ action: 'seed-defaults' }),
    });
    const postRes = await postThresholds(postReq);
    const postBody = await postRes.json();
    expect(postRes.status).toBe(200);
    expect(postBody.data.seeded).toBe(true);
  });

  it('GET & POST /config', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/config');
    const getRes = await getConfigs(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/config', {
      method: 'POST',
      body: JSON.stringify({
        establishmentName: 'Test Est',
        sector: 'GENERAL',
        sizeBracket: 'SMALL',
        saudiHeadcount: 10,
        totalHeadcount: 20,
      }),
    });
    const postRes = await postConfig(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /hires', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/hires');
    const getRes = await getHires(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/hires', {
      method: 'POST',
      body: JSON.stringify({
        action: 'record',
        employeeId: 'emp-101',
        hireDate: '2026-07-21',
      }),
    });
    const postRes = await postHire(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /snapshots', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/snapshots');
    const getRes = await getSnapshots(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/snapshots', {
      method: 'POST',
      body: JSON.stringify({
        snapshotDate: '2026-07-21',
      }),
    });
    const postRes = await postSnapshot(postReq);
    expect(postRes.status).toBe(200);
  });

  it('GET & POST /certificate', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/certificate');
    const getRes = await getCerts(getReq);
    expect(getRes.status).toBe(200);

    const postReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/certificate', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate', period: '2026-07' }),
    });
    const postRes = await postCert(postReq);
    expect(postRes.status).toBe(200);
  });

  it('POST /privilege-check', async () => {
    const postReq = new NextRequest('http://localhost/api/v1/nitaqat-compliance/privilege-check', {
      method: 'POST',
      body: JSON.stringify({ privilege: 'hireExpat' }),
    });
    const postRes = await postPrivilegeCheck(postReq);
    const postBody = await postRes.json();
    expect(postRes.status).toBe(200);
    expect(postBody.data.allowed).toBe(true);
  });
});
