import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  authorizationMatrixService,
  renewalAlertService,
  transferCaseService,
  immigrationAuditChecklistService,
  immigrationRiskService,
  immigrationComplianceCertificateService,
  alertWindow,
  daysToExpiry,
  immigrationGatingReason,
  riskBand,
  IMMIGRATION_COMPLIANCE_CONSTANTS,
} from '../immigration-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.immigrationAuthorizationMatrix = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'am-1', ...create })),
  };
  m.immigrationRenewalAlert = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'ra-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ra-1', ...data })),
  };
  m.immigrationTransferCase = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'tc-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'tc-1', ...data })),
  };
  m.immigrationAuditChecklistItem = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'ci-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ci-1', ...data })),
  };
  m.immigrationRiskEntry = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'rr-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'rr-1', ...data })),
  };
  m.immigrationComplianceCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('alertWindow ladder', () => {
  it('returns EXPIRED for negative days', () => {
    expect(alertWindow(-1)).toBe('EXPIRED');
    expect(alertWindow(-100)).toBe('EXPIRED');
  });
  it('returns WINDOW_7 inside 7 days', () => {
    expect(alertWindow(0)).toBe('WINDOW_7');
    expect(alertWindow(5)).toBe('WINDOW_7');
    expect(alertWindow(7)).toBe('WINDOW_7');
  });
  it('returns WINDOW_30 between 8 and 30 days', () => {
    expect(alertWindow(8)).toBe('WINDOW_30');
    expect(alertWindow(30)).toBe('WINDOW_30');
  });
  it('returns WINDOW_60 between 31 and 60 days', () => {
    expect(alertWindow(31)).toBe('WINDOW_60');
    expect(alertWindow(60)).toBe('WINDOW_60');
  });
  it('returns null beyond 60 days', () => {
    expect(alertWindow(61)).toBeNull();
    expect(alertWindow(365)).toBeNull();
  });
});

describe('daysToExpiry', () => {
  it('returns integer day difference', () => {
    const now = new Date('2026-07-01');
    const future = new Date('2026-07-11');
    expect(daysToExpiry(future, now)).toBe(10);
  });
  it('returns negative for past dates', () => {
    const now = new Date('2026-07-01');
    const past = new Date('2026-06-20');
    expect(daysToExpiry(past, now)).toBe(-11);
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

describe('immigrationGatingReason', () => {
  it('returns null when clean', () => {
    expect(
      immigrationGatingReason({
        expiredDocsTotal: 0,
        alerts7dOpen: 0,
        transfersOpenOverdue: 0,
        checklistFailingHighOrCritical: 0,
        checklistOverdue: 0,
        criticalRisksOpen: 0,
      })
    ).toBeNull();
  });
  it('gates on expired + 7d window + overdue transfers', () => {
    const r = immigrationGatingReason({
      expiredDocsTotal: 2,
      alerts7dOpen: 3,
      transfersOpenOverdue: 1,
      checklistFailingHighOrCritical: 0,
      checklistOverdue: 0,
      criticalRisksOpen: 0,
    });
    expect(r).toMatch(/2 expired mandatory document/);
    expect(r).toMatch(/3 renewal alert\(s\) inside 7-day/);
    expect(r).toMatch(/1 transfer case\(s\) open > 60 days/);
  });
  it('gates on checklist + risk signals', () => {
    const r = immigrationGatingReason({
      expiredDocsTotal: 0,
      alerts7dOpen: 0,
      transfersOpenOverdue: 0,
      checklistFailingHighOrCritical: 1,
      checklistOverdue: 2,
      criticalRisksOpen: 3,
    });
    expect(r).toMatch(/HIGH\/CRITICAL checklist/);
    expect(r).toMatch(/overdue/);
    expect(r).toMatch(/CRITICAL\/HIGH risk/);
  });
});

describe('renewalAlertService.raise', () => {
  it('skips when document is beyond 60-day window', async () => {
    const now = new Date('2026-07-01');
    const farFuture = new Date('2027-07-01');
    const out = await renewalAlertService.raise(
      {
        subjectId: 'e-1',
        country: 'UAE',
        documentCode: 'WORK_PERMIT',
        expiresAt: farFuture,
      },
      auth,
      now
    );
    expect(out).toBeNull();
    expect(m.immigrationRenewalAlert.upsert).not.toHaveBeenCalled();
  });
  it('writes EXPIRED window for past expiry', async () => {
    const now = new Date('2026-07-01');
    const past = new Date('2026-06-01');
    await renewalAlertService.raise(
      { subjectId: 'e-1', country: 'UAE', documentCode: 'WORK_PERMIT', expiresAt: past },
      auth,
      now
    );
    const call = m.immigrationRenewalAlert.upsert.mock.calls[0][0];
    expect(call.create.window).toBe('EXPIRED');
  });
  it('writes WINDOW_7 for expiry within 7 days', async () => {
    const now = new Date('2026-07-01');
    const soon = new Date('2026-07-05');
    await renewalAlertService.raise(
      { subjectId: 'e-1', country: 'UAE', documentCode: 'WORK_PERMIT', expiresAt: soon },
      auth,
      now
    );
    const call = m.immigrationRenewalAlert.upsert.mock.calls[0][0];
    expect(call.create.window).toBe('WINDOW_7');
  });
  it('is idempotent — upsert keyed by (subject, document, expiresAt, window)', async () => {
    const now = new Date('2026-07-01');
    const soon = new Date('2026-07-15');
    await renewalAlertService.raise(
      { subjectId: 'e-1', country: 'UAE', documentCode: 'WORK_PERMIT', expiresAt: soon },
      auth,
      now
    );
    const call = m.immigrationRenewalAlert.upsert.mock.calls[0][0];
    expect(call.where.aura_immigration_renewal_alert_unique).toMatchObject({
      tenantId: 'tenant-1',
      subjectId: 'e-1',
      documentCode: 'WORK_PERMIT',
      window: 'WINDOW_30',
    });
    expect(call.update).toEqual({});
  });
});

describe('renewalAlertService.openCountsByWindow', () => {
  it('counts only OPEN alerts grouped by window', async () => {
    m.immigrationRenewalAlert.findMany = vi
      .fn()
      .mockResolvedValue([
        { window: 'EXPIRED' },
        { window: 'WINDOW_7' },
        { window: 'WINDOW_7' },
        { window: 'WINDOW_30' },
      ]);
    const c = await renewalAlertService.openCountsByWindow('tenant-1');
    expect(c).toEqual({ EXPIRED: 1, WINDOW_7: 2, WINDOW_30: 1 });
  });
});

describe('transferCaseService.complete', () => {
  it('refuses to complete from REQUESTED (must be APPROVED)', async () => {
    m.immigrationTransferCase.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'tc-1', tenantId: 'tenant-1', status: 'REQUESTED' });
    await expect(transferCaseService.complete('tc-1', auth)).rejects.toThrow(/APPROVED/);
  });
  it('refuses cross-tenant', async () => {
    m.immigrationTransferCase.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'tc-1', tenantId: 'other', status: 'APPROVED' });
    await expect(transferCaseService.complete('tc-1', auth)).rejects.toThrow(/not found/);
  });
  it('completes from APPROVED', async () => {
    m.immigrationTransferCase.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'tc-1', tenantId: 'tenant-1', status: 'APPROVED' });
    await transferCaseService.complete('tc-1', auth);
    const call = m.immigrationTransferCase.update.mock.calls[0][0];
    expect(call.data.status).toBe('COMPLETED');
  });
});

describe('transferCaseService.openOverdueCount', () => {
  it('flags cases older than 60 days from requestedAt', async () => {
    const now = new Date('2026-07-01');
    m.immigrationTransferCase.findMany = vi.fn().mockResolvedValue([
      { requestedAt: new Date('2026-04-01') }, // 91 days
      { requestedAt: new Date('2026-06-15') }, // 16 days
    ]);
    expect(await transferCaseService.openOverdueCount('tenant-1', 60, now)).toBe(1);
  });
});

describe('immigrationAuditChecklistService.overdueCount', () => {
  it('flags items > 35 days since review', async () => {
    const now = new Date('2026-07-01');
    m.immigrationAuditChecklistItem.findMany = vi
      .fn()
      .mockResolvedValue([
        { lastReviewedAt: new Date('2026-05-01') },
        { lastReviewedAt: new Date('2026-06-27') },
        { lastReviewedAt: null },
      ]);
    expect(await immigrationAuditChecklistService.overdueCount('tenant-1', now)).toBe(2);
  });
});

describe('immigrationRiskService.upsert', () => {
  it('clamps L/I and derives score+band', async () => {
    await immigrationRiskService.upsert(
      {
        riskCode: 'IR-001',
        title: 'Work permit lapse',
        category: 'WORK_PERMIT',
        likelihood: 9,
        impact: 5,
      },
      auth
    );
    const call = m.immigrationRiskEntry.upsert.mock.calls[0][0];
    expect(call.create.score).toBe(25);
    expect(call.create.band).toBe('CRITICAL');
  });
});

describe('immigrationComplianceCertificateService', () => {
  it('refuses to sign while gated', async () => {
    m.immigrationComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'X' });
    await expect(immigrationComplianceCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign/
    );
  });
  it('signs when clean', async () => {
    m.immigrationComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: null });
    await immigrationComplianceCertificateService.sign('2026-06', [], auth);
    const call = m.immigrationComplianceCertificate.update.mock.calls[0][0];
    expect(call.data.status).toBe('SIGNED');
    expect(call.data.signedBy).toBe('user-1');
  });
  it('generate gates when expired + 7d alerts present', async () => {
    m.immigrationRenewalAlert.findMany = vi
      .fn()
      .mockResolvedValue([{ window: 'EXPIRED' }, { window: 'WINDOW_7' }, { window: 'WINDOW_7' }]);
    m.immigrationRenewalAlert.count = vi.fn().mockResolvedValue(1);
    const cert = await immigrationComplianceCertificateService.generate('2026-06', auth);
    expect(cert.expiredDocsTotal).toBe(1);
    expect(cert.alerts7dOpen).toBe(2);
    expect(cert.gatingReason).toMatch(/expired/);
    expect(cert.gatingReason).toMatch(/7-day/);
  });
});

describe('IMMIGRATION_COMPLIANCE_CONSTANTS', () => {
  it('covers all 6 GCC countries', () => {
    expect(IMMIGRATION_COMPLIANCE_CONSTANTS.COUNTRIES).toEqual([
      'UAE',
      'KSA',
      'BH',
      'QA',
      'OM',
      'KW',
    ]);
  });
  it('covers entry/work/residence/dependent visa categories', () => {
    expect(IMMIGRATION_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('ENTRY_PERMIT');
    expect(IMMIGRATION_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('WORK_PERMIT');
    expect(IMMIGRATION_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('RESIDENCE_VISA');
    expect(IMMIGRATION_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('DEPENDENT_VISA');
    expect(IMMIGRATION_COMPLIANCE_CONSTANTS.TRANSFER_OVERDUE_DAYS).toBe(60);
  });
});
