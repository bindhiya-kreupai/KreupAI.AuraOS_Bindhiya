import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  deriveBahrainizationRag,
  missedBahrainiHires,
  bahrainizationCertificateService,
  bahrainizationConfigService,
  bahrainizationHireService,
  bahrainizationGate,
  bahrainizationSnapshotService,
  BAHRAINIZATION_CONSTANTS,
} from '../bahrainization-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.bahrainizationConfig = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cfg-1', ...create })),
  };
  m.bahrainizationTarget = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 't-1', ...data })),
  };
  m.bahrainizationSnapshot = {
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 's-1', ...create })),
  };
  m.bahrainizationHire = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'h-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'h-1', ...data })),
  };
  m.bahrainizationCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
});

describe('deriveBahrainizationRag', () => {
  it('returns GREEN at or above target', () => {
    expect(deriveBahrainizationRag(15, 15)).toBe('GREEN');
    expect(deriveBahrainizationRag(20, 15)).toBe('GREEN');
  });
  it('returns AMBER within 2pp below target', () => {
    expect(deriveBahrainizationRag(14, 15)).toBe('AMBER');
    expect(deriveBahrainizationRag(13, 15)).toBe('AMBER');
  });
  it('returns RED when more than 2pp below target', () => {
    expect(deriveBahrainizationRag(12, 15)).toBe('RED');
    expect(deriveBahrainizationRag(5, 15)).toBe('RED');
  });
});

describe('missedBahrainiHires', () => {
  it('returns 0 when at or above target', () => {
    expect(missedBahrainiHires(15, 100, 15)).toBe(0);
    expect(missedBahrainiHires(20, 100, 15)).toBe(0);
  });
  it('returns positive integer when below target', () => {
    const need = missedBahrainiHires(10, 100, 15);
    expect(need).toBeGreaterThan(0);
    expect((10 + need) / (100 + need)).toBeGreaterThanOrEqual(0.15);
  });
});

describe('bahrainizationConfigService.seedDefaultTargets', () => {
  it('seeds all 4 default rows', async () => {
    const result = await bahrainizationConfigService.seedDefaultTargets(auth);
    expect(result.created.length).toBe(
      BAHRAINIZATION_CONSTANTS.DEFAULT_BAHRAINIZATION_TARGETS.length
    );
    expect(m.bahrainizationTarget.create).toHaveBeenCalledTimes(4);
  });
});

describe('bahrainizationSnapshotService.takeSnapshot', () => {
  it('throws when config not found', async () => {
    await expect(
      bahrainizationSnapshotService.takeSnapshot({ snapshotDate: new Date() }, auth)
    ).rejects.toThrow(/config not found/);
  });
  it('throws when entity not in scope', async () => {
    m.bahrainizationConfig.findUnique = vi.fn().mockResolvedValue({ isInScope: false });
    await expect(
      bahrainizationSnapshotService.takeSnapshot({ snapshotDate: new Date() }, auth)
    ).rejects.toThrow(/not in scope/);
  });
  it('computes RAG and LMRA gating from target', async () => {
    m.bahrainizationConfig.findUnique = vi.fn().mockResolvedValue({
      isInScope: true,
      sector: 'PRIVATE',
      sizeBracket: 'SMALL',
      bahrainiHeadcount: 5,
      totalHeadcount: 100,
    });
    m.bahrainizationTarget.findMany = vi
      .fn()
      .mockResolvedValue([{ targetRatioPct: 10, tenderEligibilityMinPct: 50 }]);
    await bahrainizationSnapshotService.takeSnapshot({ snapshotDate: new Date() }, auth);
    const call = m.bahrainizationSnapshot.upsert.mock.calls[0][0];
    expect(call.create.ragStatus).toBe('RED');
    expect(call.create.lmraGated).toBe(true);
    expect(call.create.tenderEligible).toBe(false);
  });
});

describe('bahrainizationHireService.detectArtificialRisk', () => {
  it('flags missing SIO registration when Bahraini', async () => {
    m.bahrainizationHire.findUnique = vi
      .fn()
      .mockResolvedValue({ isBahraini: true, sioRegistered: false, wageEvidenceLinked: false });
    await bahrainizationHireService.detectArtificialRisk('e-1', auth);
    const call = m.bahrainizationHire.update.mock.calls[0][0];
    expect(call.data.artificialRiskFlags).toContain('NO_SIO_REGISTRATION');
    expect(call.data.artificialRiskFlags).toContain('NO_WAGE_EVIDENCE');
    expect(call.data.artificialRiskScore).toBeGreaterThanOrEqual(50);
  });
});

describe('bahrainizationGate', () => {
  it('blocks expat hire when LMRA-gated', async () => {
    m.bahrainizationSnapshot.findFirst = vi
      .fn()
      .mockResolvedValue({ lmraGated: true, ratioPct: 5, targetRatioPct: 10, gapPct: -5 });
    await expect(bahrainizationGate.assertCanHireExpat('t-1', null)).rejects.toThrow(/LMRA-gated/);
  });
  it('allows expat hire when not gated', async () => {
    m.bahrainizationSnapshot.findFirst = vi
      .fn()
      .mockResolvedValue({ lmraGated: false, ratioPct: 20, targetRatioPct: 15 });
    const r = await bahrainizationGate.assertCanHireExpat('t-1', null);
    expect(r.allowed).toBe(true);
  });
  it('blocks tender bid when not eligible', async () => {
    m.bahrainizationSnapshot.findFirst = vi
      .fn()
      .mockResolvedValue({ tenderEligible: false, ratioPct: 15 });
    await expect(bahrainizationGate.assertCanBidTender('t-1', null)).rejects.toThrow(
      /Tender ineligible/
    );
  });
});

describe('bahrainizationCertificateService', () => {
  it('refuses to sign while gated', async () => {
    m.bahrainizationCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 LMRA-gated entity' });
    await expect(bahrainizationCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});
