import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  taAuditChecklistService,
  taRiskService,
  taComplianceCertificateService,
  riskBand,
  taGatingReason,
  TA_COMPLIANCE_CONSTANTS,
} from '../talent-acquisition-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.taAuditChecklistItem = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'ci-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ci-1', ...data })),
  };
  m.taRiskEntry = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'rr-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'rr-1', ...data })),
  };
  m.taComplianceCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('riskBand', () => {
  it('maps to bands', () => {
    expect(riskBand(1)).toBe('LOW');
    expect(riskBand(6)).toBe('MEDIUM');
    expect(riskBand(12)).toBe('HIGH');
    expect(riskBand(25)).toBe('CRITICAL');
  });
});

describe('taGatingReason', () => {
  it('null when clean', () => {
    expect(
      taGatingReason({
        checklistFailingHighOrCritical: 0,
        checklistOverdue: 0,
        criticalRisksOpen: 0,
      })
    ).toBeNull();
  });
  it('gates when any signal is non-zero', () => {
    const r = taGatingReason({
      checklistFailingHighOrCritical: 2,
      checklistOverdue: 3,
      criticalRisksOpen: 1,
    });
    expect(r).toMatch(/2 HIGH\/CRITICAL/);
    expect(r).toMatch(/3 checklist item\(s\) overdue/);
    expect(r).toMatch(/1 CRITICAL\/HIGH risk/);
  });
});

describe('taAuditChecklistService.overdueCount', () => {
  it('flags items > 35 days', async () => {
    const now = new Date('2026-07-01');
    m.taAuditChecklistItem.findMany = vi
      .fn()
      .mockResolvedValue([
        { lastReviewedAt: new Date('2026-04-01') },
        { lastReviewedAt: new Date('2026-06-27') },
        { lastReviewedAt: null },
      ]);
    expect(await taAuditChecklistService.overdueCount('tenant-1', now)).toBe(2);
  });
});

describe('taAuditChecklistService.stageBreakdown', () => {
  it('groups by stage and counts PASS/FAIL/OBSERVATION/unchecked', async () => {
    m.taAuditChecklistItem.findMany = vi.fn().mockResolvedValue([
      { stage: 'PLANNING', lastResult: 'PASS' },
      { stage: 'PLANNING', lastResult: 'FAIL' },
      { stage: 'PLANNING', lastResult: null },
      { stage: 'OFFER', lastResult: 'OBSERVATION' },
    ]);
    const rows = await taAuditChecklistService.stageBreakdown('tenant-1');
    const planning = rows.find((r) => r.stage === 'PLANNING');
    expect(planning).toMatchObject({ total: 3, pass: 1, fail: 1, obs: 0, unchecked: 1 });
    const offer = rows.find((r) => r.stage === 'OFFER');
    expect(offer).toMatchObject({ total: 1, obs: 1 });
  });
});

describe('taRiskService.upsert', () => {
  it('clamps L/I and derives score+band', async () => {
    await taRiskService.upsert(
      {
        riskCode: 'TR-001',
        title: 'BGV not completed',
        stage: 'SELECTION',
        category: 'BGV',
        likelihood: 9,
        impact: 5,
      },
      auth
    );
    const call = m.taRiskEntry.upsert.mock.calls[0][0];
    expect(call.create.score).toBe(25);
    expect(call.create.band).toBe('CRITICAL');
  });
});

describe('taComplianceCertificateService', () => {
  it('refuses to sign while gated', async () => {
    m.taComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'X' });
    await expect(taComplianceCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign/
    );
  });
  it('signs when clean', async () => {
    m.taComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: null });
    await taComplianceCertificateService.sign('2026-06', [], auth);
    const call = m.taComplianceCertificate.update.mock.calls[0][0];
    expect(call.data.status).toBe('SIGNED');
    expect(call.data.signedBy).toBe('user-1');
  });
  it('generate writes stage breakdown into the certificate', async () => {
    m.taAuditChecklistItem.findMany = vi.fn().mockResolvedValue([
      { stage: 'OFFER', lastResult: 'FAIL' },
      { stage: 'PRE_EMPLOYMENT', lastResult: null },
    ]);
    const cert = await taComplianceCertificateService.generate('2026-06', auth);
    expect(cert.stagesCovered).toBe(2);
    expect(Array.isArray(cert.stageBreakdownJson)).toBe(true);
  });
});

describe('TA_COMPLIANCE_CONSTANTS', () => {
  it('covers all 5 lifecycle stages', () => {
    expect(TA_COMPLIANCE_CONSTANTS.STAGES).toEqual([
      'PLANNING',
      'SOURCING',
      'SELECTION',
      'OFFER',
      'PRE_EMPLOYMENT',
    ]);
  });
  it('covers EPIC-03/04/05 categories', () => {
    expect(TA_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('WORKFORCE_PLAN');
    expect(TA_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('BGV');
    expect(TA_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('OFFER_LETTER');
    expect(TA_COMPLIANCE_CONSTANTS.CATEGORIES).toContain('MEDICAL_VISA');
  });
});

// AURA-531: risk-register / evidence / pro-actions pages consume the paginated
// `{ items, total, page, pageSize, hasNextPage }` envelope (resp.data.items),
// not a bare array. This guards that contract at the service boundary.
describe('taRiskService.list paginated envelope', () => {
  it('returns an items[] envelope scoped by tenant', async () => {
    m.taRiskEntry.findMany = vi
      .fn()
      .mockResolvedValue([{ id: 'rr-1', riskCode: 'R-1', band: 'HIGH', score: 12 }]);
    m.taRiskEntry.count = vi.fn().mockResolvedValue(1);

    const res = await taRiskService.list('tenant-1', {}, { page: 1, pageSize: 50 });

    expect(Array.isArray((res as any).items)).toBe(true);
    expect((res as any).items).toHaveLength(1);
    expect((res as any).total).toBe(1);
    expect((res as any).pageSize).toBe(50);
    expect((res as any).hasNextPage).toBe(false);
    // tenant scoping is enforced in the where clause
    const whereArg = m.taRiskEntry.findMany.mock.calls[0][0].where;
    expect(whereArg.tenantId).toBe('tenant-1');
  });
});
