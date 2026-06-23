import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    kpiValue: { upsert: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock('../kpi-catalog.service', () => ({
  kpiCatalogService: { getActive: vi.fn() },
}));

vi.mock('../kpi-threshold.service', () => ({
  kpiThresholdService: {
    resolveThreshold: vi.fn().mockResolvedValue({ greenMax: 100, amberMax: 200, redMax: 500 }),
    band: vi
      .fn()
      .mockImplementation((v: number) => ({ value: v, rag: 'GREEN', statutoryBreach: false })),
  },
}));

vi.mock('../kpi-data-quality.service', () => ({
  kpiDataQualityService: {},
}));

import { prisma } from '@aura/database';
import { kpiCatalogService } from '../kpi-catalog.service';
import { kpiComputeService } from '../kpi-compute.service';

const p = prisma as unknown as any;
const auth = { tenantId: 't1', userId: 'u1' };

beforeEach(() => vi.clearAllMocks());

describe('KpiComputeService.computeFromFormula (Pattern 8 wiring)', () => {
  it('evaluates the EPIC-38 sample formula: payslips_corrected / total * 100', async () => {
    vi.mocked(kpiCatalogService.getActive).mockResolvedValue({
      code: 'PAYROLL_ERROR_RATE',
      formula: 'payslips_corrected / total * 100',
      direction: 'LOWER_IS_BETTER',
    } as any);
    p.kpiValue.upsert.mockImplementation(async (a: any) => ({ ...a.create }));

    const out = await kpiComputeService.computeFromFormula(
      {
        kpiCode: 'PAYROLL_ERROR_RATE',
        period: '2026-06',
        inputs: { payslips_corrected: 3, total: 200 },
      },
      auth
    );

    // Value was computed: 3 / 200 * 100 = 1.5
    expect(p.kpiValue.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ value: 1.5 }),
      })
    );
    expect(Number(out.value)).toBe(1.5);
  });

  it('throws when the KPI has no ACTIVE definition', async () => {
    vi.mocked(kpiCatalogService.getActive).mockResolvedValue(null as any);

    await expect(
      kpiComputeService.computeFromFormula(
        { kpiCode: 'GHOST', period: '2026-06', inputs: { x: 1 } },
        auth
      )
    ).rejects.toThrow(/no ACTIVE definition/);
  });

  it('throws when the active definition has an empty formula field', async () => {
    vi.mocked(kpiCatalogService.getActive).mockResolvedValue({
      code: 'NO_FORMULA',
      formula: '',
    } as any);

    await expect(
      kpiComputeService.computeFromFormula(
        { kpiCode: 'NO_FORMULA', period: '2026-06', inputs: {} },
        auth
      )
    ).rejects.toThrow(/no formula/);
  });

  it('threads dot-path access through the evaluator: payroll.corrected / payroll.total', async () => {
    vi.mocked(kpiCatalogService.getActive).mockResolvedValue({
      code: 'NESTED',
      formula: 'payroll.corrected / payroll.total * 100',
    } as any);
    p.kpiValue.upsert.mockImplementation(async (a: any) => ({ ...a.create }));

    await kpiComputeService.computeFromFormula(
      {
        kpiCode: 'NESTED',
        period: '2026-06',
        inputs: { payroll: { corrected: 5, total: 250 } },
      },
      auth
    );

    expect(p.kpiValue.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ value: 2 }), // 5/250*100
      })
    );
  });
});
