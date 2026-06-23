import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  recordsDocumentMatrixService,
  recordsCompletenessService,
  recordsAuditChecklistService,
  recordsRiskService,
  recordsComplianceCertificateService,
  completenessScore,
  recordsGatingReason,
  riskBand,
  RECORDS_COMPLIANCE_CONSTANTS,
} from '../records-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.recordsDocumentMatrix = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'dm-1', ...create })),
  };
  m.recordsCompletenessSnapshot = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cs-1', ...create })),
  };
  m.recordsAuditChecklistItem = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'ci-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ci-1', ...data })),
  };
  m.recordsRiskEntry = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'rr-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'rr-1', ...data })),
  };
  m.recordsComplianceCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('completenessScore', () => {
  it('returns 100 GREEN when zero mandatory total', () => {
    expect(
      completenessScore({ mandatoryTotal: 0, mandatoryPresent: 0, expired: 0, expiringWithin30: 0 })
    ).toEqual({ score: 100, band: 'GREEN' });
  });
  it('GREEN when all present', () => {
    const r = completenessScore({
      mandatoryTotal: 10,
      mandatoryPresent: 10,
      expired: 0,
      expiringWithin30: 0,
    });
    expect(r.score).toBe(100);
    expect(r.band).toBe('GREEN');
  });
  it('AMBER between 70 and 89', () => {
    const r = completenessScore({
      mandatoryTotal: 10,
      mandatoryPresent: 8,
      expired: 0,
      expiringWithin30: 0,
    });
    expect(r.score).toBe(80);
    expect(r.band).toBe('AMBER');
  });
  it('RED below 70', () => {
    const r = completenessScore({
      mandatoryTotal: 10,
      mandatoryPresent: 5,
      expired: 0,
      expiringWithin30: 0,
    });
    expect(r.band).toBe('RED');
  });
  it('expired docs apply 5-point penalty each', () => {
    const r = completenessScore({
      mandatoryTotal: 10,
      mandatoryPresent: 10,
      expired: 2,
      expiringWithin30: 0,
    });
    expect(r.score).toBe(90);
  });
  it('expiring within 30d adds penalty capped at 10', () => {
    const r = completenessScore({
      mandatoryTotal: 10,
      mandatoryPresent: 10,
      expired: 0,
      expiringWithin30: 10,
    });
    expect(r.score).toBe(90); // 100 - min(10, 10*2) = 100 - 10
  });
});

describe('recordsGatingReason', () => {
  it('returns null when clean', () => {
    expect(
      recordsGatingReason({
        redEmployees: 0,
        checklistFailingHighOrCritical: 0,
        checklistOverdue: 0,
        criticalRisksOpen: 0,
        expiredDocsTotal: 0,
      })
    ).toBeNull();
  });
  it('gates on RED employees + expired docs', () => {
    const r = recordsGatingReason({
      redEmployees: 3,
      checklistFailingHighOrCritical: 0,
      checklistOverdue: 0,
      criticalRisksOpen: 0,
      expiredDocsTotal: 5,
    });
    expect(r).toMatch(/RED on records completeness/);
    expect(r).toMatch(/expired mandatory document/);
  });
  it('gates on HIGH/CRIT checklist + overdue + risks', () => {
    const r = recordsGatingReason({
      redEmployees: 0,
      checklistFailingHighOrCritical: 1,
      checklistOverdue: 2,
      criticalRisksOpen: 3,
      expiredDocsTotal: 0,
    });
    expect(r).toMatch(/HIGH\/CRITICAL checklist/);
    expect(r).toMatch(/overdue/);
    expect(r).toMatch(/CRITICAL\/HIGH risk/);
  });
});

describe('riskBand', () => {
  it('bands 1..25', () => {
    expect(riskBand(1)).toBe('LOW');
    expect(riskBand(6)).toBe('MEDIUM');
    expect(riskBand(12)).toBe('HIGH');
    expect(riskBand(25)).toBe('CRITICAL');
  });
});

describe('recordsCompletenessService.upsert', () => {
  it('derives mandatoryMissing, score and band', async () => {
    await recordsCompletenessService.upsert(
      {
        period: '2026-06',
        employeeId: 'e-1',
        country: 'UAE',
        mandatoryTotal: 10,
        mandatoryPresent: 6,
        expired: 1,
        expiringWithin30: 0,
        missingCodes: ['PASSPORT', 'VISA'],
      },
      auth
    );
    const call = m.recordsCompletenessSnapshot.upsert.mock.calls[0][0];
    expect(call.create.mandatoryMissing).toBe(4);
    expect(call.create.score).toBe(55); // 60 - 5
    expect(call.create.band).toBe('RED');
  });
});

describe('recordsCompletenessService.aggregate', () => {
  it('aggregates band counts, average score, missing/expired totals', async () => {
    m.recordsCompletenessSnapshot.findMany = vi.fn().mockResolvedValue([
      { band: 'GREEN', score: 95, mandatoryMissing: 0, expired: 0 },
      { band: 'AMBER', score: 80, mandatoryMissing: 1, expired: 0 },
      { band: 'RED', score: 50, mandatoryMissing: 3, expired: 2 },
    ]);
    const agg = await recordsCompletenessService.aggregate('tenant-1', '2026-06');
    expect(agg.employeesEvaluated).toBe(3);
    expect(agg.greenEmployees).toBe(1);
    expect(agg.redEmployees).toBe(1);
    expect(agg.averageScore).toBe(75);
    expect(agg.mandatoryMissingTotal).toBe(4);
    expect(agg.expiredDocsTotal).toBe(2);
  });
});

describe('recordsAuditChecklistService.overdueCount', () => {
  it('flags items > 35 days', async () => {
    const now = new Date('2026-07-01');
    m.recordsAuditChecklistItem.findMany = vi
      .fn()
      .mockResolvedValue([
        { lastReviewedAt: new Date('2026-05-01') },
        { lastReviewedAt: new Date('2026-06-27') },
        { lastReviewedAt: null },
      ]);
    expect(await recordsAuditChecklistService.overdueCount('tenant-1', now)).toBe(2);
  });
});

describe('recordsComplianceCertificateService', () => {
  it('refuses to sign while gated', async () => {
    m.recordsComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'X' });
    await expect(recordsComplianceCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign/
    );
  });
  it('generates with gating when RED employees and expired docs present', async () => {
    m.recordsCompletenessSnapshot.findMany = vi
      .fn()
      .mockResolvedValue([{ band: 'RED', score: 50, mandatoryMissing: 3, expired: 2 }]);
    const cert = await recordsComplianceCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/RED/);
    expect(cert.gatingReason).toMatch(/expired/);
  });
});

describe('RECORDS_COMPLIANCE_CONSTANTS', () => {
  it('covers identity, contract, visa, work permit', () => {
    expect(RECORDS_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('IDENTITY');
    expect(RECORDS_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('VISA');
    expect(RECORDS_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('WORK_PERMIT');
    expect(RECORDS_COMPLIANCE_CONSTANTS.EXPIRING_WINDOW_DAYS).toBe(30);
    expect(RECORDS_COMPLIANCE_CONSTANTS.SENSITIVITIES).toContain('RESTRICTED');
  });
});
