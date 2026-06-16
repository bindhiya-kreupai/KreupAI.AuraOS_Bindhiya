import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  comparisonService,
  countryComplianceCertificateService,
  countryRiskMatrixService,
  countryRulePackService,
  GCC_WIDE_THEMES,
  riskScore,
  RULE_PACK_SEEDS,
} from '../gcc-rule-library';

const prismaMock = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  prismaMock.complianceTheme = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 't-1', ...data })),
  };
  prismaMock.countryRulePack = {
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'pack-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'pack-1', ...data })),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
  };
  prismaMock.countryRule = {
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'rule-1', ...create })),
  };
  prismaMock.countryRiskMatrix = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'risk-1', ...data })),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'risk-1', ...create })),
    count: vi.fn().mockResolvedValue(0),
  };
  prismaMock.countryComplianceCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
  };
  prismaMock.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) =>
      typeof fn === 'function' ? fn(prismaMock) : Promise.all(fn)
    );
});

describe('seed-data integrity', () => {
  it('includes a rule pack for every GCC country', () => {
    const cc = RULE_PACK_SEEDS.map((p) => p.countryCode).sort();
    expect(cc).toEqual(['AE', 'BH', 'KW', 'OM', 'QA', 'SA']);
  });

  it('GCC-wide themes cover the canonical compliance pillars', () => {
    const codes = GCC_WIDE_THEMES.map((t) => t.code);
    expect(codes).toContain('WAGE_PROTECTION');
    expect(codes).toContain('SOCIAL_INSURANCE');
    expect(codes).toContain('NATIONALIZATION');
    expect(codes).toContain('EOSB');
    expect(codes).toContain('IMMIGRATION');
  });

  it('UAE pack ships the 15-day WPS window with citation', () => {
    const ae = RULE_PACK_SEEDS.find((p) => p.countryCode === 'AE')!;
    const wps = ae.rules.find((r) => r.ruleKey === 'WPS_SALARY_WINDOW_DAYS')!;
    expect(wps.value).toBe(15);
    expect(wps.authority).toBe('MOHRE');
    expect(wps.citation).toBeTruthy();
  });

  it('KSA pack ships the 7-day Mudad WPS window', () => {
    const sa = RULE_PACK_SEEDS.find((p) => p.countryCode === 'SA')!;
    const wps = sa.rules.find((r) => r.ruleKey === 'WPS_SALARY_WINDOW_DAYS')!;
    expect(wps.value).toBe(7);
    expect(wps.authority).toMatch(/Mudad/);
  });
});

describe('countryRulePackService', () => {
  it('seeds GCC themes and reports created codes', async () => {
    const { created } = await countryRulePackService.seedThemes();
    expect(created.length).toBe(GCC_WIDE_THEMES.length);
  });

  it('createDraft assigns next version = 1 when no prior versions exist', async () => {
    prismaMock.countryRulePack.findFirst.mockResolvedValue(null);
    const pack = await countryRulePackService.createDraft(
      { countryCode: 'AE', title: 't', summary: 's', rules: [] },
      auth
    );
    expect(pack.version).toBe(1);
    expect(pack.status).toBe('DRAFT');
  });

  it('createDraft bumps version when prior exists', async () => {
    prismaMock.countryRulePack.findFirst.mockResolvedValue({ id: 'p-old', version: 2 });
    const pack = await countryRulePackService.createDraft(
      { countryCode: 'AE', title: 't', summary: 's', rules: [] },
      auth
    );
    expect(pack.version).toBe(3);
  });

  it('publish retires any ACTIVE pack for the same country first', async () => {
    prismaMock.countryRulePack.findUnique.mockResolvedValue({
      id: 'p-new',
      countryCode: 'AE',
      status: 'DRAFT',
      version: 2,
    });
    await countryRulePackService.publish('p-new', new Date('2026-01-01'), auth);
    expect(prismaMock.countryRulePack.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
    expect(prismaMock.countryRulePack.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACTIVE' }) })
    );
  });

  it('publish refuses to re-publish a non-DRAFT pack', async () => {
    prismaMock.countryRulePack.findUnique.mockResolvedValue({
      id: 'p-old',
      countryCode: 'AE',
      status: 'ACTIVE',
    });
    await expect(countryRulePackService.publish('p-old', new Date(), auth)).rejects.toThrow(
      /status ACTIVE/
    );
  });
});

describe('comparisonService', () => {
  it('returns one comparison row per rule key', async () => {
    prismaMock.countryRulePack.findFirst.mockImplementation(async ({ where }: any) => ({
      id: `pack-${where.countryCode}`,
      countryCode: where.countryCode,
      version: 1,
      status: 'ACTIVE',
      effectiveFrom: new Date('2026-01-01'),
      rules: [
        {
          id: `r-${where.countryCode}`,
          domain: 'PAYROLL',
          ruleKey: 'WPS_SALARY_WINDOW_DAYS',
          value: where.countryCode === 'AE' ? 15 : 7,
          authority: 'MOHRE',
          citation: 'art X',
        },
      ],
    }));
    const rows = await comparisonService.build('PAYROLL');
    expect(rows.length).toBeGreaterThan(0);
    const wpsRow = rows.find((r) => r.ruleKey === 'WPS_SALARY_WINDOW_DAYS')!;
    expect(wpsRow.cells.AE?.value as number).toBe(15);
    expect(wpsRow.cells.SA?.value as number).toBe(7);
  });
});

describe('countryRiskMatrixService', () => {
  it('riskScore bands score correctly', () => {
    expect(riskScore(1, 1)).toEqual({ score: 1, rating: 'LOW' });
    expect(riskScore(4, 4)).toEqual({ score: 16, rating: 'HIGH' });
    expect(riskScore(5, 5)).toEqual({ score: 25, rating: 'CRITICAL' });
  });

  it('rejects upserts with out-of-range likelihood/impact', async () => {
    await expect(
      countryRiskMatrixService.upsert(
        {
          countryCode: 'AE',
          riskCode: 'X',
          title: 't',
          description: 'd',
          domain: 'PAYROLL',
          likelihood: 6,
          impact: 3,
          ownerRole: 'PAYROLL_OFFICER',
        },
        auth
      )
    ).rejects.toThrow(/1..5/);
  });

  it('seedRegional creates the seeded risks', async () => {
    const { created } = await countryRiskMatrixService.seedRegional(auth);
    expect(created.length).toBeGreaterThanOrEqual(6);
  });
});

describe('countryComplianceCertificateService', () => {
  it('generates a certificate with NOT_APPLICABLE for unprovided domains', async () => {
    const row = await countryComplianceCertificateService.generate(
      'AE',
      '2026-05',
      undefined,
      auth
    );
    expect(row.status).toBe('DRAFT');
    expect(Array.isArray(row.domainStatus)).toBe(true);
  });

  it('blocks signing while critical risks are open', async () => {
    prismaMock.countryRiskMatrix.count.mockResolvedValue(1);
    const generated = await countryComplianceCertificateService.generate(
      'AE',
      '2026-05',
      [{ domain: 'PAYROLL', status: 'PASS' }],
      auth
    );
    prismaMock.countryComplianceCertificate.findUnique.mockResolvedValue(generated);
    await expect(
      countryComplianceCertificateService.sign('AE', '2026-05', [], auth)
    ).rejects.toThrow(/critical risk/);
  });

  it('signs when no gating reason is set', async () => {
    prismaMock.countryComplianceCertificate.findUnique.mockResolvedValue({
      id: 'cert-1',
      gatingReason: null,
    });
    const signed = await countryComplianceCertificateService.sign(
      'AE',
      '2026-05',
      [{ field: 'attestation', value: 'OK' }],
      auth
    );
    expect(signed.status).toBe('SIGNED');
    expect(signed.signedBy).toBe('user-1');
  });
});
