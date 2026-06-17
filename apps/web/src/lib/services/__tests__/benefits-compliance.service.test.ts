import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  accrueMonths,
  benefitCatalogueService,
  benefitCoverageService,
  benefitVendorService,
  benefitExceptionService,
  benefitCertificateService,
  BENEFITS_CONSTANTS,
} from '../benefits-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.benefitCatalogue = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
  };
  m.benefitCoverage = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({ _sum: { accruedBalance: 0 } }),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cov-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cov-1', ...data })),
  };
  m.benefitVendor = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'v-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'v-1', ...data })),
  };
  m.benefitException = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'e-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'e-1', ...data })),
  };
  m.benefitCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('accrueMonths', () => {
  it('returns zero before any months elapsed', () => {
    const start = new Date('2026-06-01');
    const r = accrueMonths(2400, start, null, start);
    expect(r.monthsAccrued).toBe(0);
    expect(r.amountAccrued).toBe(0);
  });
  it('accrues monthly proportion of annual value', () => {
    const start = new Date('2026-01-01');
    const asOf = new Date('2026-04-01'); // 3 months later
    const r = accrueMonths(2400, start, null, asOf);
    expect(r.monthsAccrued).toBe(3);
    expect(r.amountAccrued).toBe(600);
  });
  it('uses lastAccruedAt when present', () => {
    const start = new Date('2026-01-01');
    const lastAccrued = new Date('2026-03-01');
    const asOf = new Date('2026-06-01'); // 3 months from lastAccrued
    const r = accrueMonths(2400, start, lastAccrued, asOf);
    expect(r.monthsAccrued).toBe(3);
    expect(r.amountAccrued).toBe(600);
  });
});

describe('benefitCatalogueService.seedDefaults', () => {
  it('seeds all default catalogue rows', async () => {
    const r = await benefitCatalogueService.seedDefaults(auth);
    expect(r.created.length).toBe(BENEFITS_CONSTANTS.DEFAULT_CATALOGUE.length);
  });
});

describe('benefitCoverageService.enroll', () => {
  it('throws when catalogue entry not found', async () => {
    m.benefitCatalogue.findMany = vi.fn().mockResolvedValue([]);
    await expect(
      benefitCoverageService.enroll(
        { employeeId: 'e-1', benefitCode: 'UNKNOWN', startedAt: new Date() },
        auth
      )
    ).rejects.toThrow(/not found/);
  });
  it('throws when vendor required but missing', async () => {
    m.benefitCatalogue.findMany = vi
      .fn()
      .mockResolvedValue([{ id: 'c-1', vendorRequired: true, annualValue: 5000, currency: 'AED' }]);
    await expect(
      benefitCoverageService.enroll(
        { employeeId: 'e-1', benefitCode: 'M', startedAt: new Date() },
        auth
      )
    ).rejects.toThrow(/requires a vendor/);
  });
  it('enrolls with catalogue defaults when no overrides', async () => {
    m.benefitCatalogue.findMany = vi
      .fn()
      .mockResolvedValue([
        { id: 'c-1', vendorRequired: false, annualValue: 5000, currency: 'AED' },
      ]);
    await benefitCoverageService.enroll(
      { employeeId: 'e-1', benefitCode: 'M', startedAt: new Date() },
      auth
    );
    const call = m.benefitCoverage.upsert.mock.calls[0][0];
    expect(call.create.actualAnnualValue).toBe(5000);
    expect(call.create.currency).toBe('AED');
  });
});

describe('benefitCoverageService.accrue', () => {
  it('adds accrued amount to existing balance and stamps lastAccruedAt', async () => {
    const startedAt = new Date(Date.now() - 90 * 24 * 3600 * 1000);
    m.benefitCoverage.findUnique = vi.fn().mockResolvedValue({
      id: 'cov-1',
      tenantId: 'tenant-1',
      startedAt,
      lastAccruedAt: null,
      actualAnnualValue: 2400,
      accruedBalance: 100,
    });
    await benefitCoverageService.accrue('cov-1', auth);
    const call = m.benefitCoverage.update.mock.calls[0][0];
    expect(call.data.accruedBalance).toBeGreaterThan(100);
    expect(call.data.lastAccruedAt).toBeInstanceOf(Date);
  });
});

describe('benefitVendorService.signDpa', () => {
  it('sets dpaSigned + dpaSignedAt', async () => {
    await benefitVendorService.signDpa('v-1', auth);
    const call = m.benefitVendor.update.mock.calls[0][0];
    expect(call.data.dpaSigned).toBe(true);
    expect(call.data.dpaSignedAt).toBeInstanceOf(Date);
  });
});

describe('benefitCertificateService', () => {
  it('gates when mandatory cover gaps exist', async () => {
    m.benefitCatalogue.findMany = vi
      .fn()
      .mockResolvedValueOnce([{ id: 'c-1', benefitCode: 'MEDICAL' }]); // mandatoryCats
    m.benefitCoverage.count = vi.fn().mockResolvedValue(0);
    const cert = await benefitCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/mandatory cover gap/);
  });
  it('gates when vendors without DPA exist', async () => {
    m.benefitVendor.count = vi.fn().mockResolvedValue(2);
    const cert = await benefitCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/without DPA/);
  });
  it('refuses to sign while gated', async () => {
    m.benefitCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 mandatory cover gap(s)' });
    await expect(benefitCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});
