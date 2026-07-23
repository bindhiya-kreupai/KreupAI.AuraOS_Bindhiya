import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  complianceRiskRegisterService,
  computeRating,
  deriveWorkforceClass,
  digitalMaturityService,
  gccCountryProfileService,
  gccRbacService,
  gccTenancyService,
  isGccCountry,
  platformAlertService,
  workforceClassificationService,
  workforceKpiService,
} from '../gcc-landscape';

const prismaMock = prisma as any;

const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  // Default stubs — overridden in individual tests as needed.
  prismaMock.gccTenantCountry = {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'tc-1', ...create })),
    update: vi.fn().mockResolvedValue({ id: 'tc-1', isEnabled: false }),
  };
  prismaMock.gccLegalEntity = {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'le-1', ...data })),
    update: vi.fn().mockResolvedValue({ id: 'le-1', isActive: false }),
  };
  prismaMock.gccCountryProfile = {
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cp-1', ...data })),
    update: vi.fn().mockResolvedValue({}),
  };
  prismaMock.workforceClassification = {
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'wc-1', ...data })),
    update: vi.fn().mockResolvedValue({}),
  };
  prismaMock.platformAlertRule = {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'rule-1', ...create })),
  };
  prismaMock.platformAlertInstance = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'inst-1', ...data })),
  };
  prismaMock.role = {
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'role-1', ...data })),
  };
  prismaMock.permission = {
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'perm-1', ...create })),
  };
  prismaMock.rolePermission = {
    upsert: vi.fn().mockResolvedValue({}),
  };
  prismaMock.gccRoleScope = {
    findMany: vi.fn().mockResolvedValue([]),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'scope-1', ...data })),
  };
  prismaMock.userRole = {
    findMany: vi.fn().mockResolvedValue([]),
  };
  prismaMock.complianceRiskRegister = {
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'risk-1', ...data })),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'risk-1', ...create })),
  };
  prismaMock.localizationTarget = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'tgt-1', ...data })),
  };
  prismaMock.workforceKpiSnapshot = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'snap-1', ...create })),
  };
  prismaMock.digitalMaturityDomain = {
    findUnique: vi
      .fn()
      .mockResolvedValue({ id: 'dom-1', code: 'PAYROLL', name: 'Payroll automation' }),
    findMany: vi
      .fn()
      .mockResolvedValue([{ id: 'dom-1', code: 'PAYROLL', name: 'Payroll automation' }]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'dom-1', ...data })),
  };
  prismaMock.digitalMaturitySnapshot = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'mat-1', ...create })),
  };
  prismaMock.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) =>
      typeof fn === 'function' ? fn(prismaMock) : Promise.all(fn)
    );
  prismaMock.$queryRawUnsafe = vi.fn().mockResolvedValue([]);
});

describe('country-defaults', () => {
  it('recognises the six GCC countries (case-insensitive)', () => {
    expect(isGccCountry('AE')).toBe(true);
    expect(isGccCountry('sa')).toBe(true);
    expect(isGccCountry('IN')).toBe(false);
  });

  it('derives NATIONAL when nationality matches country of employment', () => {
    expect(deriveWorkforceClass('AE', 'AE')).toBe('NATIONAL');
  });
  it('derives GCC_NATIONAL_OTHER for cross-GCC employment', () => {
    expect(deriveWorkforceClass('SA', 'AE')).toBe('GCC_NATIONAL_OTHER');
  });
  it('derives EXPAT for non-GCC nationality', () => {
    expect(deriveWorkforceClass('IN', 'AE')).toBe('EXPAT');
  });
  it('rejects unsupported country of employment', () => {
    expect(() => deriveWorkforceClass('AE', 'US')).toThrow();
  });
});

describe('gccTenancyService', () => {
  it('rejects non-GCC country codes', async () => {
    await expect(gccTenancyService.enableCountry({ countryCode: 'US' }, auth)).rejects.toThrow(
      /not a supported GCC country/
    );
  });

  it('blocks creating a legal entity when the country is not enabled', async () => {
    prismaMock.gccTenantCountry.findUnique.mockResolvedValue(null);
    await expect(
      gccTenancyService.createLegalEntity(
        { countryCode: 'AE', legalName: 'Acme UAE', registrationRef: 'MOHRE-1' },
        auth
      )
    ).rejects.toThrow(/not enabled/);
  });

  it('creates a legal entity when the country is enabled, defaulting registrationType', async () => {
    prismaMock.gccTenantCountry.findUnique.mockResolvedValue({
      id: 'tc-1',
      isEnabled: true,
      defaultCurrency: 'AED',
      defaultTimezone: 'Asia/Dubai',
    });
    const entity = await gccTenancyService.createLegalEntity(
      { countryCode: 'AE', legalName: 'Acme UAE', registrationRef: 'MOHRE-100' },
      auth
    );
    expect(entity.countryCode).toBe('AE');
    expect(entity.currency).toBe('AED');
    expect(entity.registrationType).toBe('MOHRE_ESTABLISHMENT');
  });

  it('blocks creating a legal entity when a duplicate registration reference exists', async () => {
    prismaMock.gccTenantCountry.findUnique.mockResolvedValue({
      id: 'tc-1',
      isEnabled: true,
      defaultCurrency: 'AED',
      defaultTimezone: 'Asia/Dubai',
    });
    prismaMock.gccLegalEntity.findFirst.mockResolvedValue({
      id: 'le-old',
      countryCode: 'AE',
      registrationRef: 'MOHRE-100',
    });
    await expect(
      gccTenancyService.createLegalEntity(
        { countryCode: 'AE', legalName: 'Acme UAE Duplicate', registrationRef: 'MOHRE-100' },
        auth
      )
    ).rejects.toThrow(/already exists/);
  });

  it('deactivates a legal entity', async () => {
    prismaMock.gccLegalEntity.update.mockResolvedValue({ id: 'le-1', isActive: false });
    const result = await gccTenancyService.deactivateLegalEntity('le-1', auth);
    expect(prismaMock.gccLegalEntity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'le-1' },
        data: expect.objectContaining({ isActive: false }),
      })
    );
    expect(result.isActive).toBe(false);
  });
});

describe('gccCountryProfileService', () => {
  it('seeds all six GCC profiles when none exist', async () => {
    const result = await gccCountryProfileService.seedDefaults(auth);
    expect(result.created.sort()).toEqual(['AE', 'BH', 'KW', 'OM', 'QA', 'SA']);
    expect(prismaMock.gccCountryProfile.create).toHaveBeenCalledTimes(6);
  });

  it('creating a new version retires the prior version and increments version', async () => {
    const current = {
      id: 'p-1',
      countryCode: 'AE',
      weekendPattern: 'SAT_SUN',
      statutoryCurrency: 'AED',
      labourAuthority: 'MOHRE',
      socialInsuranceAuthority: 'GPSSA',
      nationalizationProgramme: 'Emiratisation',
      expatProfile: 'HIGH',
      marketNotes: '...',
      authoritiesJson: {},
      version: 1,
    };
    prismaMock.gccCountryProfile.findFirst.mockResolvedValue(current);
    const result = await gccCountryProfileService.createVersion(
      'AE',
      { weekendPattern: 'FRI_SAT' },
      auth
    );
    expect(prismaMock.gccCountryProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'RETIRED' }) })
    );
    expect(result.version).toBe(2);
    expect(result.weekendPattern).toBe('FRI_SAT');
  });
});

describe('workforceClassificationService', () => {
  it('flags missing nationality as a data-quality issue (no insert)', async () => {
    await expect(
      workforceClassificationService.classify(
        { employeeId: 'emp-1', nationality: '', countryOfEmployment: 'AE' },
        auth
      )
    ).rejects.toThrow(/nationality missing/);
  });

  it('classifies an Emirati in UAE as NATIONAL with Emiratisation flag', async () => {
    const row = await workforceClassificationService.classify(
      { employeeId: 'emp-1', nationality: 'AE', countryOfEmployment: 'AE' },
      auth
    );
    expect(row.workforceClass).toBe('NATIONAL');
    expect(row.isEmiratisationEligible).toBe(true);
    expect(row.isGccNational).toBe(true);
  });

  it('detects cross-GCC unified flag (Saudi national in UAE)', async () => {
    const row = await workforceClassificationService.classify(
      { employeeId: 'emp-2', nationality: 'SA', countryOfEmployment: 'AE' },
      auth
    );
    expect(row.workforceClass).toBe('GCC_NATIONAL_OTHER');
    expect(row.isCrossGccUnified).toBe(true);
  });

  it('versions classification — close out previous row, then create new', async () => {
    prismaMock.workforceClassification.findFirst.mockResolvedValue({
      id: 'wc-prev',
      classificationVersion: 1,
    });
    const row = await workforceClassificationService.classify(
      { employeeId: 'emp-3', nationality: 'IN', countryOfEmployment: 'AE' },
      auth
    );
    expect(prismaMock.workforceClassification.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'wc-prev' } })
    );
    expect(row.classificationVersion).toBe(2);
  });
});

describe('platformAlertService', () => {
  it('rejects rules with no thresholds', async () => {
    await expect(
      platformAlertService.upsertRule(
        { code: 'X', name: 'X', eventType: 'foo', thresholds: [] },
        auth
      )
    ).rejects.toThrow(/threshold/);
  });

  it('fires alerts at thresholds where daysToDue ≤ threshold', async () => {
    prismaMock.platformAlertRule.findUnique.mockResolvedValue({
      id: 'rule-1',
      isActive: true,
      thresholds: [
        { days: 60, channel: 'EMAIL' },
        { days: 30, channel: 'EMAIL' },
        { days: 7, channel: 'IN_APP' },
      ],
      recipientRoles: ['PRO_OFFICER'],
    });
    const now = new Date('2026-01-01T00:00:00Z');
    const due = new Date('2026-02-20T00:00:00Z'); // 50 days away → only 60-day fires
    const result = await platformAlertService.fireIfDue(
      {
        ruleCode: 'VISA_EXPIRY',
        resourceType: 'visa',
        resourceId: 'visa-1',
        triggeredFor: due,
        currentDate: now,
      },
      auth
    );
    expect(result.fired).toEqual(['60']);
  });

  it('ignores idempotency violations from concurrent fires', async () => {
    prismaMock.platformAlertRule.findUnique.mockResolvedValue({
      id: 'rule-1',
      isActive: true,
      thresholds: [{ days: 60, channel: 'EMAIL' }],
      recipientRoles: ['PRO_OFFICER'],
    });
    prismaMock.platformAlertInstance.create.mockRejectedValue(new Error('Unique constraint'));
    const now = new Date('2026-01-01T00:00:00Z');
    const due = new Date('2026-02-20T00:00:00Z');
    const result = await platformAlertService.fireIfDue(
      {
        ruleCode: 'VISA_EXPIRY',
        resourceType: 'visa',
        resourceId: 'visa-1',
        triggeredFor: due,
        currentDate: now,
      },
      auth
    );
    expect(result.fired).toEqual([]);
  });
});

describe('gccRbacService', () => {
  it('seeds the ten GCC personas', async () => {
    const { created } = await gccRbacService.seedPersonas(auth);
    expect(created.length).toBe(10);
    expect(created).toContain('SYSTEM_ADMINISTRATOR');
    expect(created).toContain('PRO_OFFICER');
  });

  it('resolveUserCountryScope returns ALL when at least one scope has no countryCode', async () => {
    prismaMock.userRole.findMany.mockResolvedValue([{ id: 'ur-1' }]);
    prismaMock.gccRoleScope.findMany.mockResolvedValue([
      { countryCode: null, legalEntityId: null },
    ]);
    const scope = await gccRbacService.resolveUserCountryScope('user-1', 'tenant-1');
    expect(scope.countries).toBe('ALL');
  });

  it('resolveUserCountryScope returns intersection when scopes are scoped', async () => {
    prismaMock.userRole.findMany.mockResolvedValue([{ id: 'ur-1' }]);
    prismaMock.gccRoleScope.findMany.mockResolvedValue([
      { countryCode: 'AE', legalEntityId: null },
      { countryCode: 'SA', legalEntityId: null },
    ]);
    const scope = await gccRbacService.resolveUserCountryScope('user-1', 'tenant-1');
    expect(scope.countries).toEqual(['AE', 'SA']);
  });
});

describe('complianceRiskRegisterService', () => {
  it('computeRating bands likelihood × impact correctly', () => {
    expect(computeRating(1, 1)).toEqual({ score: 1, rating: 'LOW' });
    expect(computeRating(3, 3)).toEqual({ score: 9, rating: 'MEDIUM' });
    expect(computeRating(4, 4)).toEqual({ score: 16, rating: 'HIGH' });
    expect(computeRating(5, 5)).toEqual({ score: 25, rating: 'CRITICAL' });
  });

  it('rejects likelihood/impact outside 1..5', async () => {
    await expect(
      complianceRiskRegisterService.upsert(
        {
          riskCode: 'X',
          category: 'NATIONALIZATION',
          title: 't',
          description: 'd',
          likelihood: 6,
          impact: 3,
          ownerRole: 'HR_MANAGER',
        },
        auth
      )
    ).rejects.toThrow(/1..5/);
  });

  it('seeds the five regional risk themes', async () => {
    const { created } = await complianceRiskRegisterService.seedRegionalRisks(auth);
    expect(created.length).toBe(5);
    expect(created).toContain('VISA_PERMIT_EXPIRY');
  });
});

describe('workforceKpiService', () => {
  it('rejects out-of-bounds targetPct', async () => {
    await expect(
      workforceKpiService.setTarget({ countryCode: 'AE', targetPct: 120 }, auth)
    ).rejects.toThrow(/0..100/);
  });

  it('aggregates buckets by country and class', async () => {
    prismaMock.$queryRawUnsafe.mockResolvedValue([
      { countryCode: 'AE', workforceClass: 'NATIONAL', headcount: 5 },
      { countryCode: 'AE', workforceClass: 'EXPAT', headcount: 95 },
      { countryCode: 'SA', workforceClass: 'NATIONAL', headcount: 60 },
      { countryCode: 'SA', workforceClass: 'EXPAT', headcount: 40 },
    ]);
    const buckets = await workforceKpiService.computeBuckets('tenant-1');
    const ae = buckets.find((b) => b.countryCode === 'AE')!;
    const sa = buckets.find((b) => b.countryCode === 'SA')!;
    expect(ae.totalHeadcount).toBe(100);
    expect(ae.nationalCount).toBe(5);
    expect(sa.nationalCount).toBe(60);
  });
});

describe('digitalMaturityService', () => {
  it('rejects current/target outside 1..5', async () => {
    await expect(
      digitalMaturityService.upsert(
        { domainCode: 'PAYROLL', period: '2026-Q2', currentLevel: 0, targetLevel: 3 },
        auth
      )
    ).rejects.toThrow(/1..5/);
  });

  it('flags improvement priority when gap ≥ 2', async () => {
    const row = await digitalMaturityService.upsert(
      { domainCode: 'PAYROLL', period: '2026-Q2', currentLevel: 1, targetLevel: 4 },
      auth
    );
    expect(row.gap).toBe(3);
    expect(row.isImprovementPriority).toBe(true);
  });

  it('computeIndex averages the latest levels per domain', () => {
    const idx = digitalMaturityService.computeIndex([
      { latest: { currentLevel: 3, targetLevel: 5 } as any },
      { latest: { currentLevel: 4, targetLevel: 5 } as any },
      { latest: null },
    ]);
    expect(idx.current).toBe(3.5);
    expect(idx.target).toBe(5);
    expect(idx.gap).toBe(1.5);
  });
});
