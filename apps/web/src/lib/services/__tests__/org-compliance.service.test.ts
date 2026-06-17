import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  orgAuditChecklistService,
  orgPositionControlService,
  orgVacancyService,
  orgComplianceCertificateService,
  headcountVariance,
  agingDays,
  orgGatingReason,
  ORG_COMPLIANCE_CONSTANTS,
} from '../org-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.orgAuditChecklistItem = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'ci-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ci-1', ...data })),
  };
  m.orgPositionControl = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'pc-1', ...create })),
  };
  m.orgVacancy = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'v-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'v-1', ...data })),
  };
  m.orgComplianceCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('headcountVariance', () => {
  it('vacant when filled below approved', () => {
    expect(headcountVariance({ budgeted: 10, approved: 10, filled: 7 })).toEqual({
      vacant: 3,
      overhire: 0,
    });
  });
  it('overhire when filled above approved', () => {
    expect(headcountVariance({ budgeted: 10, approved: 8, filled: 11 })).toEqual({
      vacant: 0,
      overhire: 3,
    });
  });
  it('clamps both to 0 when equal', () => {
    expect(headcountVariance({ budgeted: 10, approved: 8, filled: 8 })).toEqual({
      vacant: 0,
      overhire: 0,
    });
  });
});

describe('agingDays', () => {
  it('returns integer days', () => {
    expect(agingDays(new Date('2026-04-01'), null, new Date('2026-04-11'))).toBe(10);
  });
  it('uses filledAt when present', () => {
    expect(agingDays(new Date('2026-04-01'), new Date('2026-04-05'), new Date('2026-04-30'))).toBe(
      4
    );
  });
  it('never negative', () => {
    expect(agingDays(new Date('2026-05-01'), null, new Date('2026-04-01'))).toBe(0);
  });
});

describe('orgGatingReason', () => {
  it('returns null when clean', () => {
    expect(
      orgGatingReason({
        checklistFailingHighOrCritical: 0,
        checklistOverdue: 0,
        overhireTotal: 0,
        vacanciesAgedOver90: 0,
        unapprovedVacancies: 0,
      })
    ).toBeNull();
  });
  it('gates on overhire + aged vacancies', () => {
    const r = orgGatingReason({
      checklistFailingHighOrCritical: 0,
      checklistOverdue: 0,
      overhireTotal: 2,
      vacanciesAgedOver90: 1,
      unapprovedVacancies: 0,
    });
    expect(r).toMatch(/overhire/);
    expect(r).toMatch(/aged over 90 days/);
  });
  it('gates on HIGH/CRIT checklist + unapproved vacancies', () => {
    const r = orgGatingReason({
      checklistFailingHighOrCritical: 1,
      checklistOverdue: 2,
      overhireTotal: 0,
      vacanciesAgedOver90: 0,
      unapprovedVacancies: 3,
    });
    expect(r).toMatch(/HIGH\/CRITICAL checklist/);
    expect(r).toMatch(/overdue/);
    expect(r).toMatch(/without approval/);
  });
});

describe('orgAuditChecklistService.overdueCount', () => {
  it('flags items > 35 days since last review', async () => {
    const now = new Date('2026-07-01');
    m.orgAuditChecklistItem.findMany = vi.fn().mockResolvedValue([
      { lastReviewedAt: new Date('2026-05-01') }, // 60d stale
      { lastReviewedAt: new Date('2026-06-25') }, // 6d fresh
      { lastReviewedAt: null }, // never reviewed
    ]);
    expect(await orgAuditChecklistService.overdueCount('tenant-1', now)).toBe(2);
  });
});

describe('orgPositionControlService.upsert', () => {
  it('derives vacant + overhire from headcount inputs', async () => {
    await orgPositionControlService.upsert(
      { period: '2026-06', budgetedHeadcount: 10, approvedHeadcount: 10, filledHeadcount: 8 },
      auth
    );
    const call = m.orgPositionControl.upsert.mock.calls[0][0];
    expect(call.create.vacantHeadcount).toBe(2);
    expect(call.create.overhireCount).toBe(0);
  });
});

describe('orgVacancyService', () => {
  it('refuses to fill unknown vacancy', async () => {
    m.orgVacancy.findUnique = vi.fn().mockResolvedValue(null);
    await expect(orgVacancyService.fill('x', undefined, auth)).rejects.toThrow(/not found/);
  });
  it('fill sets aging days from raisedAt', async () => {
    m.orgVacancy.findUnique = vi.fn().mockResolvedValue({
      id: 'v-1',
      tenantId: 'tenant-1',
      raisedAt: new Date(Date.now() - 30 * 86_400_000),
    });
    await orgVacancyService.fill('v-1', 'cand-1', auth);
    const call = m.orgVacancy.update.mock.calls[0][0];
    expect(call.data.status).toBe('FILLED');
    expect(call.data.candidateId).toBe('cand-1');
    expect(call.data.agingDays).toBeGreaterThanOrEqual(29);
  });
  it('openAged separates aged + unapproved counts', async () => {
    m.orgVacancy.findMany = vi.fn().mockResolvedValue([
      { raisedAt: new Date(Date.now() - 100 * 86_400_000), approvedAt: null },
      { raisedAt: new Date(Date.now() - 5 * 86_400_000), approvedAt: new Date() },
    ]);
    const out = await orgVacancyService.openAged('tenant-1');
    expect(out.open).toBe(2);
    expect(out.aged).toBe(1);
    expect(out.unapproved).toBe(1);
  });
});

describe('orgComplianceCertificateService.sign', () => {
  it('refuses while gated', async () => {
    m.orgComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'X' });
    await expect(orgComplianceCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign/
    );
  });
  it('signs when clean', async () => {
    m.orgComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: null });
    await orgComplianceCertificateService.sign('2026-06', [], auth);
    const call = m.orgComplianceCertificate.update.mock.calls[0][0];
    expect(call.data.status).toBe('SIGNED');
    expect(call.data.signedBy).toBe('user-1');
  });
});

describe('ORG_COMPLIANCE_CONSTANTS', () => {
  it('covers org structure categories', () => {
    expect(ORG_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('LEGAL_ENTITY');
    expect(ORG_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('POSITION_CONTROL');
    expect(ORG_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('NATIONALIZATION');
    expect(ORG_COMPLIANCE_CONSTANTS.VACANCY_AGE_GATE_DAYS).toBe(90);
  });
});
