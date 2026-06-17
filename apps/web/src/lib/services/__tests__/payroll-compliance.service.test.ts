import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  payrollGovernanceService,
  payrollAuditFindingService,
  payrollRiskService,
  payrollComplianceCertificateService,
  riskBand,
  payrollGatingReason,
  PAYROLL_COMPLIANCE_CONSTANTS,
} from '../payroll-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.payrollGovernanceControl = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'gc-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'gc-1', ...data })),
  };
  m.payrollAuditFinding = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'af-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'af-1', ...data })),
  };
  m.payrollRiskEntry = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'pr-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'pr-1', ...data })),
  };
  m.payrollComplianceCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  m.payrollRun = {
    count: vi.fn().mockResolvedValue(0),
    findMany: vi.fn().mockResolvedValue([]),
  };
  m.bankPaymentFile = { count: vi.fn().mockResolvedValue(0) };
  m.glPosting = { count: vi.fn().mockResolvedValue(0) };
});

describe('riskBand', () => {
  it('maps score to band', () => {
    expect(riskBand(1)).toBe('LOW');
    expect(riskBand(6)).toBe('MEDIUM');
    expect(riskBand(12)).toBe('HIGH');
    expect(riskBand(20)).toBe('CRITICAL');
    expect(riskBand(25)).toBe('CRITICAL');
  });
});

describe('payrollGatingReason', () => {
  it('returns null when clean', () => {
    expect(
      payrollGatingReason({
        runsCount: 2,
        runsApproved: 2,
        runsLocked: 2,
        runsMakerCheckerBreaches: 0,
        openFindingsCritical: 0,
        criticalRisksOpen: 0,
        controlsOverdue: 0,
        reconciliationVariancePct: 0,
        bankFileMismatches: 0,
        glPostingsMissing: 0,
      })
    ).toBeNull();
  });
  it('gates on unapproved run', () => {
    const r = payrollGatingReason({
      runsCount: 3,
      runsApproved: 1,
      runsLocked: 0,
      runsMakerCheckerBreaches: 0,
      openFindingsCritical: 0,
      criticalRisksOpen: 0,
      controlsOverdue: 0,
      reconciliationVariancePct: 0,
      bankFileMismatches: 0,
      glPostingsMissing: 0,
    });
    expect(r).toMatch(/2 payroll run\(s\) not approved/);
    expect(r).toMatch(/not period-locked/);
  });
  it('gates on maker-checker breach + critical findings + variance', () => {
    const r = payrollGatingReason({
      runsCount: 1,
      runsApproved: 1,
      runsLocked: 1,
      runsMakerCheckerBreaches: 2,
      openFindingsCritical: 1,
      criticalRisksOpen: 0,
      controlsOverdue: 0,
      reconciliationVariancePct: 1.25,
      bankFileMismatches: 0,
      glPostingsMissing: 0,
    });
    expect(r).toMatch(/maker-checker/);
    expect(r).toMatch(/CRITICAL audit finding/);
    expect(r).toMatch(/variance 1\.25%/);
  });
  it('does not gate at 0.5% variance threshold edge', () => {
    const r = payrollGatingReason({
      runsCount: 1,
      runsApproved: 1,
      runsLocked: 1,
      runsMakerCheckerBreaches: 0,
      openFindingsCritical: 0,
      criticalRisksOpen: 0,
      controlsOverdue: 0,
      reconciliationVariancePct: 0.5,
      bankFileMismatches: 0,
      glPostingsMissing: 0,
    });
    expect(r).toBeNull();
  });
  it('gates on bank-file mismatch and missing GL postings', () => {
    const r = payrollGatingReason({
      runsCount: 1,
      runsApproved: 1,
      runsLocked: 1,
      runsMakerCheckerBreaches: 0,
      openFindingsCritical: 0,
      criticalRisksOpen: 0,
      controlsOverdue: 0,
      reconciliationVariancePct: 0,
      bankFileMismatches: 2,
      glPostingsMissing: 3,
    });
    expect(r).toMatch(/bank-file mismatch/);
    expect(r).toMatch(/GL posting/);
  });
});

describe('payrollGovernanceService.overdueCount', () => {
  it('flags MONTHLY controls older than 35 days', async () => {
    const now = new Date('2026-07-01');
    const stale = new Date('2026-05-01'); // 60 days old
    const fresh = new Date('2026-06-25'); // 6 days old
    m.payrollGovernanceControl.findMany = vi.fn().mockResolvedValue([
      { lastReviewedAt: stale, frequency: 'MONTHLY' },
      { lastReviewedAt: fresh, frequency: 'MONTHLY' },
      { lastReviewedAt: null, frequency: 'MONTHLY' },
    ]);
    const n = await payrollGovernanceService.overdueCount('tenant-1', now);
    expect(n).toBe(2); // stale + null
  });
  it('uses cadence-specific thresholds', async () => {
    const now = new Date('2026-07-01');
    const weeklyOld = new Date('2026-06-20'); // 11 days
    const weeklyFresh = new Date('2026-06-28'); // 3 days
    m.payrollGovernanceControl.findMany = vi.fn().mockResolvedValue([
      { lastReviewedAt: weeklyOld, frequency: 'WEEKLY' },
      { lastReviewedAt: weeklyFresh, frequency: 'WEEKLY' },
    ]);
    expect(await payrollGovernanceService.overdueCount('tenant-1', now)).toBe(1);
  });
});

describe('payrollRiskService.upsert', () => {
  it('clamps L/I to 1..5 and derives score+band', async () => {
    await payrollRiskService.upsert(
      {
        riskCode: 'PR-001',
        title: 'GL posting drift',
        category: 'GL_POSTING',
        likelihood: 9,
        impact: 4,
      },
      auth
    );
    const call = m.payrollRiskEntry.upsert.mock.calls[0][0];
    expect(call.create.score).toBe(20); // 5 * 4
    expect(call.create.band).toBe('CRITICAL');
  });
});

describe('payrollComplianceCertificateService', () => {
  it('refuses to sign while gated', async () => {
    m.payrollComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'X' });
    await expect(payrollComplianceCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign/
    );
  });
  it('signs when clean', async () => {
    m.payrollComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: null });
    await payrollComplianceCertificateService.sign('2026-06', [], auth);
    const call = m.payrollComplianceCertificate.update.mock.calls[0][0];
    expect(call.data.status).toBe('SIGNED');
    expect(call.data.signedBy).toBe('user-1');
  });
  it('generate computes reconciliationVariancePct from runs', async () => {
    m.payrollRun.findMany = vi.fn().mockResolvedValue([
      { totalGross: 10000, totalDeductions: 2000, totalNet: 7900 }, // expected 8000, actual 7900, variance 1%
    ]);
    m.payrollRun.count = vi.fn().mockResolvedValue(0);
    const cert = await payrollComplianceCertificateService.generate('2026-06', auth);
    expect(Number(cert.reconciliationVariancePct)).toBeCloseTo(1, 2);
    expect(cert.gatingReason).toMatch(/Reconciliation variance/);
  });
});

describe('PAYROLL_COMPLIANCE_CONSTANTS', () => {
  it('covers SOD, period lock and GL posting categories', () => {
    expect(PAYROLL_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('SOD');
    expect(PAYROLL_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('PERIOD_LOCK');
    expect(PAYROLL_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('GL_POSTING');
    expect(PAYROLL_COMPLIANCE_CONSTANTS.RECONCILIATION_THRESHOLD_PCT).toBe(0.5);
  });
});
