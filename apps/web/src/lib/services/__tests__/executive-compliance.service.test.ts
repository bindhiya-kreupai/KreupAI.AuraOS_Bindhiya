import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  domainScore,
  executiveRollupService,
  complianceRiskService,
  complianceCorrectiveActionService,
  complianceReviewCalendarService,
  executiveComplianceCertificateService,
  EXECUTIVE_COMPLIANCE_CONSTANTS,
} from '../executive-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.complianceKpiSnapshot = {
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 's-1', ...create })),
  };
  m.complianceRiskEntry = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
  };
  m.complianceCorrectiveAction = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'a-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'a-1', ...data })),
  };
  m.complianceReviewCalendarItem = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ci-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ci-1', ...data })),
  };
  m.executiveComplianceCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  // Stub every domain certificate model to return null cert by default — keeps
  // rollup at 100% GREEN baseline.
  for (const d of EXECUTIVE_COMPLIANCE_CONSTANTS.DOMAIN_INVENTORY) {
    if (!m[d.model]) m[d.model] = {};
    m[d.model].findFirst = vi.fn().mockResolvedValue(null);
  }
});

describe('domainScore', () => {
  it('returns 100 GREEN when no blocking issues and not gated', () => {
    const r = domainScore({ blockingIssues: 0, certificateGated: false });
    expect(r.score).toBe(100);
    expect(r.rag).toBe('GREEN');
  });
  it('drops 30 when gated', () => {
    const r = domainScore({ blockingIssues: 0, certificateGated: true });
    expect(r.score).toBe(70);
    expect(r.rag).toBe('AMBER');
  });
  it('subtracts 5 per blocking issue (capped at 40)', () => {
    expect(domainScore({ blockingIssues: 4, certificateGated: false }).score).toBe(80);
    expect(domainScore({ blockingIssues: 20, certificateGated: false }).score).toBe(60);
  });
  it('flips to RED below 70', () => {
    const r = domainScore({ blockingIssues: 10, certificateGated: true });
    expect(r.rag).toBe('RED');
  });
});

describe('executiveRollupService.snapshot', () => {
  it('rolls up GREEN baseline when no certificates exist', async () => {
    const snaps = await executiveRollupService.snapshot('tenant-1', '2026-06');
    expect(snaps.length).toBe(EXECUTIVE_COMPLIANCE_CONSTANTS.DOMAIN_INVENTORY.length);
    expect(snaps.every((s) => s.ragStatus === 'GREEN')).toBe(true);
    expect(snaps.every((s) => s.score === 100)).toBe(true);
  });
  it('derives RED from gated certificate with many blockers', async () => {
    m.wpsCertificate = {
      findFirst: vi.fn().mockResolvedValue({
        status: 'DRAFT',
        gatingReason: 'Blocked: 1; 2; 3; 4; 5; 6; 7; 8',
      }),
    };
    const snaps = await executiveRollupService.snapshot('tenant-1', '2026-06');
    const wps = snaps.find((s) => s.domain === 'WPS');
    expect(wps?.ragStatus).toBe('RED');
  });
});

describe('complianceRiskService.upsert', () => {
  it('computes score and band from likelihood × impact', async () => {
    await complianceRiskService.upsert(
      { title: 't', domain: 'WPS', likelihood: 5, impact: 4 },
      auth
    );
    const call = m.complianceRiskEntry.create.mock.calls[0][0];
    expect(call.data.score).toBe(20);
    expect(call.data.band).toBe('CRITICAL');
  });
  it('clamps likelihood and impact to 1–5', async () => {
    await complianceRiskService.upsert(
      { title: 't', domain: 'OT', likelihood: 0, impact: 99 },
      auth
    );
    const call = m.complianceRiskEntry.create.mock.calls[0][0];
    expect(call.data.score).toBe(5); // 1 × 5
  });
});

describe('complianceReviewCalendarService.complete', () => {
  it('rolls dueAt forward by frequency interval', async () => {
    const dueAt = new Date('2026-06-01');
    m.complianceReviewCalendarItem.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'ci-1', dueAt, frequency: 'MONTHLY' });
    await complianceReviewCalendarService.complete('ci-1', auth);
    const call = m.complianceReviewCalendarItem.update.mock.calls[0][0];
    const expected = new Date(dueAt);
    expected.setDate(expected.getDate() + 30);
    expect((call.data.dueAt as Date).toISOString().slice(0, 10)).toBe(
      expected.toISOString().slice(0, 10)
    );
  });
});

describe('executiveComplianceCertificateService', () => {
  it('gates when RED domains present', async () => {
    m.wpsCertificate = {
      findFirst: vi.fn().mockResolvedValue({
        status: 'DRAFT',
        gatingReason: 'Blocked: 1; 2; 3; 4; 5; 6; 7; 8',
      }),
    };
    const cert = await executiveComplianceCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/RED domain/);
  });
  it('gates when HIGH/CRITICAL risks open', async () => {
    m.complianceRiskEntry.count = vi.fn().mockResolvedValue(3);
    const cert = await executiveComplianceCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/HIGH\/CRITICAL/);
  });
  it('gates when corrective actions overdue', async () => {
    m.complianceCorrectiveAction.count = vi.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(2);
    const cert = await executiveComplianceCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/overdue corrective action/);
  });
  it('refuses to sign while gated', async () => {
    m.executiveComplianceCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 RED domain(s)' });
    await expect(executiveComplianceCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});

describe('EXECUTIVE_COMPLIANCE_CONSTANTS', () => {
  it('exposes all 22 domains', () => {
    expect(EXECUTIVE_COMPLIANCE_CONSTANTS.DOMAIN_INVENTORY.length).toBe(22);
    const codes = EXECUTIVE_COMPLIANCE_CONSTANTS.DOMAIN_INVENTORY.map((d) => d.domain);
    expect(codes).toContain('WPS');
    expect(codes).toContain('HSE');
    expect(codes).toContain('SEPARATION');
  });
});
