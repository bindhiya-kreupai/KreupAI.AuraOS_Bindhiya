import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  complianceChecklistService,
  complianceRiskService,
  dashboardSummary,
  riskBandFromScore,
  DEFAULT_SEEDS,
  SUPPORTED_DOMAINS,
} from '../compliance-audit-register';

const prismaMock = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  prismaMock.complianceAuditChecklistItem = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'chk-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'chk-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  prismaMock.complianceRiskRegisterEntry = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'rsk-1', ...data })),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'rsk-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'rsk-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
});

describe('Seeds + supported domains', () => {
  it('ships seeds for all 5 Theme C domains', () => {
    expect(SUPPORTED_DOMAINS).toEqual(['ER', 'DISCIPLINARY', 'SEPARATION', 'EOSB', 'VISA_EXIT']);
  });

  it('each domain has at least 1 checklist seed and 1 risk seed', () => {
    for (const d of SUPPORTED_DOMAINS) {
      const seed = DEFAULT_SEEDS[d];
      expect(seed.checklist.length).toBeGreaterThan(0);
      expect(seed.risks.length).toBeGreaterThan(0);
    }
  });
});

describe('riskBandFromScore', () => {
  it('LOW for score 1-3', () => {
    expect(riskBandFromScore(1)).toBe('LOW');
    expect(riskBandFromScore(3)).toBe('LOW');
  });
  it('MEDIUM for score 4-8', () => {
    expect(riskBandFromScore(4)).toBe('MEDIUM');
    expect(riskBandFromScore(8)).toBe('MEDIUM');
  });
  it('HIGH for score 9-15', () => {
    expect(riskBandFromScore(9)).toBe('HIGH');
    expect(riskBandFromScore(15)).toBe('HIGH');
  });
  it('CRITICAL for score >= 16', () => {
    expect(riskBandFromScore(16)).toBe('CRITICAL');
    expect(riskBandFromScore(25)).toBe('CRITICAL');
  });
});

describe('ComplianceChecklistService', () => {
  it('seed rejects unknown domain', async () => {
    await expect(complianceChecklistService.seed('UNKNOWN', auth)).rejects.toThrow(
      /no seeds for domain/
    );
  });

  it('seed reports created codes for ER', async () => {
    const result = await complianceChecklistService.seed('ER', auth);
    expect(result.created.length).toBeGreaterThan(0);
    expect(result.created[0]).toMatch(/^ER-CHK-/);
  });

  it('marking item COMPLIANT sets completedAt + completedBy', async () => {
    const result = await complianceChecklistService.update(
      'ER-CHK-01',
      'ER',
      { status: 'COMPLIANT' },
      auth
    );
    expect(result.status).toBe('COMPLIANT');
    expect(result.completedAt).toBeInstanceOf(Date);
    expect(result.completedBy).toBe('user-1');
  });
});

describe('ComplianceRiskService', () => {
  it('upsert rejects likelihood outside 1-5', async () => {
    await expect(
      complianceRiskService.upsert(
        {
          domainCode: 'ER',
          riskCode: 'TEST',
          title: 'Test',
          likelihood: 7,
          impact: 3,
        },
        auth
      )
    ).rejects.toThrow(/likelihood/);
  });

  it('upsert rejects impact outside 1-5', async () => {
    await expect(
      complianceRiskService.upsert(
        {
          domainCode: 'ER',
          riskCode: 'TEST',
          title: 'Test',
          likelihood: 3,
          impact: 0,
        },
        auth
      )
    ).rejects.toThrow(/impact/);
  });

  it('upsert derives score = likelihood × impact and correct band', async () => {
    const result = await complianceRiskService.upsert(
      {
        domainCode: 'ER',
        riskCode: 'ER-RSK-T1',
        title: 'Test',
        likelihood: 4,
        impact: 5,
      },
      auth
    );
    expect(result.score).toBe(20);
    expect(result.band).toBe('CRITICAL');
  });

  it('upsert derives MEDIUM for L×I = 6', async () => {
    const result = await complianceRiskService.upsert(
      {
        domainCode: 'EOSB',
        riskCode: 'EOSB-RSK-T1',
        title: 'Test',
        likelihood: 2,
        impact: 3,
      },
      auth
    );
    expect(result.score).toBe(6);
    expect(result.band).toBe('MEDIUM');
  });

  it('seed reports created codes for VISA_EXIT', async () => {
    const result = await complianceRiskService.seed('VISA_EXIT', auth);
    expect(result.created.length).toBeGreaterThan(0);
    expect(result.created[0]).toMatch(/^VEX-RSK-/);
  });

  it('review sets reviewedAt + reviewedBy + status', async () => {
    const result = await complianceRiskService.review(
      'ER-RSK-01',
      'ER',
      { status: 'MITIGATED', mitigationPlan: 'Quarterly review + new control' },
      auth
    );
    expect(result.status).toBe('MITIGATED');
    expect(result.reviewedBy).toBe('user-1');
    expect(result.reviewedAt).toBeInstanceOf(Date);
  });
});

describe('dashboardSummary', () => {
  it('returns one row per supported domain with counters', async () => {
    const result = await dashboardSummary('tenant-1');
    expect(result.length).toBe(SUPPORTED_DOMAINS.length);
    for (const row of result) {
      expect(SUPPORTED_DOMAINS).toContain(row.domainCode);
      expect(typeof row.openMandatory).toBe('number');
      expect(typeof row.openHighOrCritical).toBe('number');
    }
  });
});

// Theme D — verify the 4 new hr-forms-compliance templates ship.
import { DEFAULT_TEMPLATES } from '../hr-forms-compliance';

describe('Theme D — hr-forms-compliance default templates', () => {
  it('includes MISCONDUCT_REPORT, EOSB_CALC_SHEET, VISA_EXIT_CHECKLIST, EMPLOYEE_FILE_AUDIT_SHEET', () => {
    const codes = DEFAULT_TEMPLATES.map((t) => t.templateCode);
    expect(codes).toContain('MISCONDUCT_REPORT');
    expect(codes).toContain('EOSB_CALC_SHEET');
    expect(codes).toContain('VISA_EXIT_CHECKLIST');
    expect(codes).toContain('EMPLOYEE_FILE_AUDIT_SHEET');
  });

  it('EOSB_CALC_SHEET writebackTarget points at eosb.calculation', () => {
    const eosb = DEFAULT_TEMPLATES.find((t) => t.templateCode === 'EOSB_CALC_SHEET');
    expect(eosb?.writebackTarget).toBe('eosb.calculation');
    expect(eosb?.isMandatory).toBe(true);
  });
});
