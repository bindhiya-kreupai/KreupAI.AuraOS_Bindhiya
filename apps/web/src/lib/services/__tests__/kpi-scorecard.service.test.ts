import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  KPI_CATALOG_SEED,
  DEFAULT_DOMAIN_WEIGHTS,
  kpiCatalogService,
  kpiCertificateService,
  kpiComputeService,
  kpiDataQualityService,
  kpiScorecardService,
  kpiThresholdService,
} from '../kpi-scorecard';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.kpiDefinition = {
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'def-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'def-1', ...data })),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
  };
  m.kpiThreshold = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'th-1', ...create })),
  };
  m.kpiValue = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'v-1', ...create })),
  };
  m.kpiDataQualityCheck = {
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'dq-1', ...data })),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  };
  m.kpiScorecardWeight = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'w-1', ...data })),
  };
  m.kpiCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  m.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) => (typeof fn === 'function' ? fn(m) : Promise.all(fn)));
});

describe('catalog seed integrity', () => {
  it('catalog covers every required compliance domain', () => {
    const domains = new Set(KPI_CATALOG_SEED.map((k) => k.domain));
    for (const need of [
      'GOVERNANCE',
      'WORKFORCE',
      'PAYROLL',
      'WPS',
      'SOCIAL_INSURANCE',
      'NATIONALIZATION',
      'IMMIGRATION',
      'LEAVE',
      'ATTENDANCE_OT',
      'BENEFITS',
      'ACCOMMODATION',
      'HSE',
      'EMPLOYEE_RELATIONS',
      'SEPARATION',
      'DOCUMENT_RETENTION',
      'AUDIT',
      'AUTOMATION',
    ]) {
      expect(domains.has(need)).toBe(true);
    }
  });

  it('every KPI carries formula + dataSource + ownerRole + frequency', () => {
    for (const k of KPI_CATALOG_SEED) {
      expect(k.formula).toBeTruthy();
      expect(k.dataSource).toBeTruthy();
      expect(k.ownerRole).toBeTruthy();
      expect(k.frequency).toBeTruthy();
    }
  });

  it('domain weights cover the scorecard domains', () => {
    const weighted = new Set(Object.keys(DEFAULT_DOMAIN_WEIGHTS));
    for (const k of KPI_CATALOG_SEED) {
      expect(weighted.has(k.domain)).toBe(true);
    }
  });
});

describe('kpiCatalogService', () => {
  it('upsertDraftDefinition assigns version 1 when no prior versions', async () => {
    const def = await kpiCatalogService.upsertDraftDefinition(KPI_CATALOG_SEED[0], auth);
    expect(def.version).toBe(1);
    expect(def.status).toBe('DRAFT');
  });

  it('approve retires prior ACTIVE definition for the same code', async () => {
    m.kpiDefinition.findUnique.mockResolvedValue({
      id: 'def-new',
      tenantId: 'tenant-1',
      code: 'PAYROLL_ON_TIME',
      status: 'DRAFT',
    });
    await kpiCatalogService.approve('def-new', auth);
    expect(m.kpiDefinition.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'RETIRED' }),
      })
    );
  });

  it('approve refuses to approve a RETIRED definition', async () => {
    m.kpiDefinition.findUnique.mockResolvedValue({ status: 'RETIRED' });
    await expect(kpiCatalogService.approve('x', auth)).rejects.toThrow(/RETIRED/);
  });
});

describe('kpiThresholdService.band', () => {
  it('returns null RAG with no threshold', () => {
    expect(kpiThresholdService.band(95, null, 'HIGHER_IS_BETTER').rag).toBeNull();
  });
  it('HIGHER_IS_BETTER: value below amberMin is RED', () => {
    const r = kpiThresholdService.band(
      80,
      { greenMin: 95, amberMin: 85 } as any,
      'HIGHER_IS_BETTER'
    );
    expect(r.rag).toBe('RED');
  });
  it('HIGHER_IS_BETTER: value at greenMin is GREEN', () => {
    const r = kpiThresholdService.band(
      95,
      { greenMin: 95, amberMin: 85 } as any,
      'HIGHER_IS_BETTER'
    );
    expect(r.rag).toBe('GREEN');
  });
  it('HIGHER_IS_BETTER: value between is AMBER', () => {
    const r = kpiThresholdService.band(
      90,
      { greenMin: 95, amberMin: 85 } as any,
      'HIGHER_IS_BETTER'
    );
    expect(r.rag).toBe('AMBER');
  });
  it('LOWER_IS_BETTER: above amberMax is RED', () => {
    const r = kpiThresholdService.band(7, { greenMax: 1, amberMax: 3 } as any, 'LOWER_IS_BETTER');
    expect(r.rag).toBe('RED');
  });
});

describe('kpiDataQualityService.runStandardChecks', () => {
  it('COMPLETENESS fails when rowCount < expectedMinRows', () => {
    const checks = kpiDataQualityService.runStandardChecks({
      rowCount: 5,
      expectedMinRows: 10,
      computedAt: new Date(),
      cutoffAt: new Date(Date.now() + 1000),
    });
    expect(checks.find((c) => c.name === 'COMPLETENESS')!.passed).toBe(false);
  });
  it('TIMELINESS fails when computedAt > cutoffAt', () => {
    const checks = kpiDataQualityService.runStandardChecks({
      rowCount: 100,
      computedAt: new Date(Date.now() + 5000),
      cutoffAt: new Date(Date.now()),
    });
    expect(checks.find((c) => c.name === 'TIMELINESS')!.passed).toBe(false);
  });
});

describe('kpiComputeService', () => {
  it('throws when no ACTIVE definition exists for the code', async () => {
    m.kpiDefinition.findFirst.mockResolvedValue(null);
    await expect(
      kpiComputeService.record({ kpiCode: 'PAYROLL_ON_TIME', period: '2026-06', value: 99 }, auth)
    ).rejects.toThrow(/no ACTIVE definition/);
  });

  it('records a value with banding when a definition + threshold exist', async () => {
    m.kpiDefinition.findFirst.mockResolvedValue({
      direction: 'HIGHER_IS_BETTER',
    });
    m.kpiThreshold.findUnique.mockResolvedValue({
      greenMin: 95,
      amberMin: 85,
    });
    const row = await kpiComputeService.record(
      { kpiCode: 'PAYROLL_ON_TIME', period: '2026-06', value: 99 },
      auth
    );
    expect(row.ragStatus).toBe('GREEN');
  });
});

describe('kpiScorecardService.compute', () => {
  it('rolls up RAG counts into per-domain and overall scores', async () => {
    m.kpiDefinition.findMany.mockResolvedValue([
      { code: 'PAY1', domain: 'PAYROLL' },
      { code: 'PAY2', domain: 'PAYROLL' },
      { code: 'WPS1', domain: 'WPS' },
    ]);
    m.kpiValue.findMany.mockResolvedValue([
      { kpiCode: 'PAY1', ragStatus: 'GREEN' },
      { kpiCode: 'PAY2', ragStatus: 'AMBER' },
      { kpiCode: 'WPS1', ragStatus: 'RED' },
    ]);
    m.kpiScorecardWeight.findMany.mockResolvedValue([
      { domain: 'PAYROLL', weight: 12 },
      { domain: 'WPS', weight: 14 },
    ]);
    const sc = await kpiScorecardService.compute('tenant-1', '2026-06');
    const payroll = sc.lines.find((l) => l.domain === 'PAYROLL')!;
    expect(payroll.greenCount).toBe(1);
    expect(payroll.amberCount).toBe(1);
    expect(payroll.domainScore).toBe(80); // (100+60)/2
    expect(sc.overallScore).toBeGreaterThan(0);
  });
});

describe('kpiCertificateService', () => {
  it('generate sets gating reason when DQ failures present', async () => {
    m.kpiValue.findMany.mockResolvedValue([{ ragStatus: 'GREEN' }, { ragStatus: 'RED' }]);
    m.kpiDataQualityCheck.count.mockResolvedValue(3);
    const cert = await kpiCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/DQ failures/);
  });

  it('sign refuses when gating reason set', async () => {
    m.kpiCertificate.findUnique.mockResolvedValue({
      id: 'cert-1',
      gatingReason: 'Blocked: 2 DQ failures',
    });
    await expect(kpiCertificateService.sign('2026-06', [], auth)).rejects.toThrow(/gated/);
  });

  it('sign succeeds when no gating reason', async () => {
    m.kpiCertificate.findUnique.mockResolvedValue({
      id: 'cert-1',
      gatingReason: null,
    });
    const signed = await kpiCertificateService.sign('2026-06', [], auth);
    expect(signed.status).toBe('SIGNED');
    expect(signed.signedBy).toBe('user-1');
  });
});
