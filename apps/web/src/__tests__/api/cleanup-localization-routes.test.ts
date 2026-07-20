import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// createProtectedRoute injects { auth } with the tenant/user derived from the
// session. We stub the wrapper so any client-sent id is ignored by the route.
vi.mock('@/lib/api/route-wrapper', () => ({
  createProtectedRoute:
    (handler: any) =>
    (request: any, ctx: any = {}) =>
      handler(request, { auth: { tenantId: 'tenant-1', userId: 'user-1' }, ...ctx }),
}));

vi.mock('@aura/database', () => ({
  prisma: {
    corporateBankAccount: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    governmentReportArchive: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import {
  GET as listAccounts,
  POST as createAccount,
} from '@/app/api/payroll/corporate-bank-accounts/route';
import {
  GET as listReports,
  POST as createReport,
} from '@/app/api/localization/government-reports/route';

const db = prisma as any;

describe('corporate-bank-accounts API (AURA-606)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes the account list by tenant', async () => {
    db.corporateBankAccount.findMany.mockResolvedValue([]);
    db.corporateBankAccount.count.mockResolvedValue(0);
    const request = new NextRequest('http://localhost/api/payroll/corporate-bank-accounts');
    const response = await listAccounts(request as any, {} as any);
    expect(response.status).toBe(200);
    expect(db.corporateBankAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } })
    );
  });

  it('binds a created account to the authenticated tenant and ignores client ids', async () => {
    db.corporateBankAccount.updateMany.mockResolvedValue({ count: 0 });
    db.corporateBankAccount.create.mockResolvedValue({ id: 'acc-1', accountName: 'Ops Account' });
    const request = new NextRequest('http://localhost/api/payroll/corporate-bank-accounts', {
      method: 'POST',
      body: JSON.stringify({
        id: 'spoofed-id',
        accountName: 'Ops Account',
        bankName: 'HDFC',
        accountNumber: '123456',
        isPrimary: true,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await createAccount(request as any, {} as any);
    const payload = await response.json();
    expect(response.status).toBe(201);
    // primary demotion first
    expect(db.corporateBankAccount.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', isPrimary: true } })
    );
    expect(db.corporateBankAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', createdBy: 'user-1' }),
      })
    );
    // client id must not be written
    const createArg = db.corporateBankAccount.create.mock.calls[0][0];
    expect(createArg.data.id).toBeUndefined();
    expect(payload.account.id).toBe('acc-1');
  });

  it('rejects an account without required fields with a bilingual error', async () => {
    const request = new NextRequest('http://localhost/api/payroll/corporate-bank-accounts', {
      method: 'POST',
      body: JSON.stringify({ accountName: 'Partial' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await createAccount(request as any, {} as any);
    const payload = await response.json();
    expect(response.status).toBe(400);
    expect(payload.message).toBeTruthy();
    expect(payload.messageAr).toBeTruthy();
  });
});

describe('government-reports archive API (AURA-610)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes the archive list by tenant and country filter', async () => {
    db.governmentReportArchive.findMany.mockResolvedValue([]);
    db.governmentReportArchive.count.mockResolvedValue(0);
    const request = new NextRequest(
      'http://localhost/api/localization/government-reports?country=IN'
    );
    const response = await listReports(request as any, {} as any);
    expect(response.status).toBe(200);
    expect(db.governmentReportArchive.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', country: 'IN' } })
    );
  });

  it('persists a generated filing bound to the tenant', async () => {
    db.governmentReportArchive.create.mockResolvedValue({ id: 'rpt-1', reportType: 'Form 16' });
    const request = new NextRequest('http://localhost/api/localization/government-reports', {
      method: 'POST',
      body: JSON.stringify({
        country: 'IN',
        reportType: 'Form 16',
        period: '2026-06',
        authority: 'Income Tax Dept',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await createReport(request as any, {} as any);
    const payload = await response.json();
    expect(response.status).toBe(201);
    expect(db.governmentReportArchive.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          country: 'IN',
          reportType: 'Form 16',
          period: '2026-06',
          createdBy: 'user-1',
        }),
      })
    );
    expect(payload.entry.id).toBe('rpt-1');
  });

  it('rejects a filing without required fields with a bilingual error', async () => {
    const request = new NextRequest('http://localhost/api/localization/government-reports', {
      method: 'POST',
      body: JSON.stringify({ country: 'IN' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await createReport(request as any, {} as any);
    const payload = await response.json();
    expect(response.status).toBe(400);
    expect(payload.message).toBeTruthy();
    expect(payload.messageAr).toBeTruthy();
  });
});
