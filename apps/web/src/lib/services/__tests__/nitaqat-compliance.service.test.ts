import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  deriveBand,
  hiresToNextBand,
  nitaqatCertificateService,
  nitaqatConfigService,
  nitaqatHireService,
  nitaqatPrivilegeGate,
  nitaqatBandSnapshotService,
  NITAQAT_CONSTANTS,
} from '../nitaqat-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.nitaqatConfig = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cfg-1', ...create })),
  };
  m.nitaqatBandThreshold = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 't-1', ...data })),
  };
  m.nitaqatBandSnapshot = {
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 's-1', ...create })),
  };
  m.nitaqatHire = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'h-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'h-1', ...data })),
  };
  m.nitaqatCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
});

describe('deriveBand', () => {
  const t = { redMaxPct: 6, yellowMaxPct: 9, greenMaxPct: 12 };
  it('returns RED when at red boundary', () => {
    expect(deriveBand(6, t)).toBe('RED');
    expect(deriveBand(0, t)).toBe('RED');
  });
  it('returns YELLOW between red and yellow boundaries', () => {
    expect(deriveBand(7, t)).toBe('YELLOW');
    expect(deriveBand(9, t)).toBe('YELLOW');
  });
  it('returns GREEN between yellow and green boundaries', () => {
    expect(deriveBand(10, t)).toBe('GREEN');
    expect(deriveBand(12, t)).toBe('GREEN');
  });
  it('returns PLATINUM above green', () => {
    expect(deriveBand(15, t)).toBe('PLATINUM');
  });
});

describe('hiresToNextBand', () => {
  const t = { redMaxPct: 6, yellowMaxPct: 9, greenMaxPct: 12 };
  it('returns 0 when totalHeadcount is 0', () => {
    expect(hiresToNextBand(0, 0, t)).toBe(0);
  });
  it('returns positive count when below RED', () => {
    expect(hiresToNextBand(0, 100, t)).toBeGreaterThan(0);
  });
  it('returns hires needed to escape RED into YELLOW', () => {
    // 100 staff with 6 Saudis = 6% (RED). Need to move > 9%.
    const need = hiresToNextBand(6, 100, t);
    expect(need).toBeGreaterThanOrEqual(3);
    // Verify result actually puts us above 9%:
    const newPct = ((6 + need) / (100 + need)) * 100;
    expect(newPct).toBeGreaterThan(9);
  });
});

describe('nitaqatConfigService', () => {
  it('seedDefaultThresholds creates the four PRIVATE size brackets', async () => {
    const r = await nitaqatConfigService.seedDefaultThresholds(auth);
    expect(r.created.length).toBe(4);
    expect(r.created).toContain('PRIVATE/MEDIUM');
    expect(r.created).toContain('PRIVATE/LARGE');
  });

  it('seedDefaultThresholds gracefully ignores duplicates', async () => {
    m.nitaqatBandThreshold.create.mockImplementation(async () => {
      throw new Error('Unique constraint');
    });
    const r = await nitaqatConfigService.seedDefaultThresholds(auth);
    expect(r.created).toEqual([]);
  });

  it('upsertConfig marks entity in scope when totalHeadcount > 0', async () => {
    const row = await nitaqatConfigService.upsertConfig(
      {
        establishmentName: 'Demo',
        sector: 'PRIVATE',
        sizeBracket: 'MEDIUM',
        saudiHeadcount: 10,
        totalHeadcount: 100,
      },
      auth
    );
    expect(row.isInScope).toBe(true);
  });
});

describe('nitaqatBandSnapshotService.takeSnapshot', () => {
  it('throws when config missing', async () => {
    m.nitaqatConfig.findUnique.mockResolvedValue(null);
    await expect(
      nitaqatBandSnapshotService.takeSnapshot({ snapshotDate: new Date() }, auth)
    ).rejects.toThrow(/config not found/);
  });

  it('throws when threshold missing for sector/size', async () => {
    m.nitaqatConfig.findUnique.mockResolvedValue({
      isInScope: true,
      sector: 'PRIVATE',
      sizeBracket: 'MEDIUM',
      saudiHeadcount: 5,
      totalHeadcount: 100,
    });
    m.nitaqatBandThreshold.findMany.mockResolvedValue([]);
    await expect(
      nitaqatBandSnapshotService.takeSnapshot({ snapshotDate: new Date() }, auth)
    ).rejects.toThrow(/threshold/);
  });

  it('writes snapshot with band + ptToNextBandHires + privileges', async () => {
    m.nitaqatConfig.findUnique.mockResolvedValue({
      isInScope: true,
      sector: 'PRIVATE',
      sizeBracket: 'MEDIUM',
      saudiHeadcount: 5,
      totalHeadcount: 100,
    });
    m.nitaqatBandThreshold.findMany.mockResolvedValue([
      { redMaxPct: 6, yellowMaxPct: 9, greenMaxPct: 12 },
    ]);
    const s = await nitaqatBandSnapshotService.takeSnapshot({ snapshotDate: new Date() }, auth);
    expect(s.saudizationPct).toBe(5);
    expect(s.band).toBe('RED');
    expect(s.ptToNextBandHires).toBeGreaterThan(0);
    expect(s.privilegesJson).toEqual(NITAQAT_CONSTANTS.BAND_PRIVILEGES.RED);
  });

  it('PLATINUM band conveys full privileges including expedited Qiwa', async () => {
    m.nitaqatConfig.findUnique.mockResolvedValue({
      isInScope: true,
      sector: 'PRIVATE',
      sizeBracket: 'MEDIUM',
      saudiHeadcount: 20,
      totalHeadcount: 100,
    });
    m.nitaqatBandThreshold.findMany.mockResolvedValue([
      { redMaxPct: 6, yellowMaxPct: 9, greenMaxPct: 12 },
    ]);
    const s = await nitaqatBandSnapshotService.takeSnapshot({ snapshotDate: new Date() }, auth);
    expect(s.band).toBe('PLATINUM');
    expect(s.privilegesJson.expeditedQiwa).toBe(true);
  });
});

describe('nitaqatPrivilegeGate', () => {
  it('RED band refuses expat hire + visa renewal + worker transfer', async () => {
    m.nitaqatBandSnapshot.findFirst.mockResolvedValue({ band: 'RED' });
    await expect(nitaqatPrivilegeGate.assertCanHireExpat('tenant-1', null)).rejects.toThrow(
      /RED.*canHireExpats/
    );
    await expect(nitaqatPrivilegeGate.assertCanRenewVisa('tenant-1', null)).rejects.toThrow(
      /RED.*canRenewVisas/
    );
    await expect(nitaqatPrivilegeGate.assertCanTransfer('tenant-1', null)).rejects.toThrow(
      /RED.*canTransferWorkers/
    );
  });

  it('YELLOW band refuses expat hire + transfer but allows visa renewal', async () => {
    m.nitaqatBandSnapshot.findFirst.mockResolvedValue({ band: 'YELLOW' });
    await expect(nitaqatPrivilegeGate.assertCanHireExpat('tenant-1', null)).rejects.toThrow(
      /YELLOW.*canHireExpats/
    );
    const r = await nitaqatPrivilegeGate.assertCanRenewVisa('tenant-1', null);
    expect(r.allowed).toBe(true);
  });

  it('GREEN band allows all standard privileges', async () => {
    m.nitaqatBandSnapshot.findFirst.mockResolvedValue({ band: 'GREEN' });
    expect((await nitaqatPrivilegeGate.assertCanHireExpat('tenant-1', null)).allowed).toBe(true);
    expect((await nitaqatPrivilegeGate.assertCanRenewVisa('tenant-1', null)).allowed).toBe(true);
    expect((await nitaqatPrivilegeGate.assertCanTransfer('tenant-1', null)).allowed).toBe(true);
  });

  it('refuses when no snapshot exists', async () => {
    m.nitaqatBandSnapshot.findFirst.mockResolvedValue(null);
    await expect(nitaqatPrivilegeGate.assertCanHireExpat('tenant-1', null)).rejects.toThrow(
      /no Nitaqat snapshot/
    );
  });
});

describe('nitaqatCertificateService', () => {
  it('generate sets gating reason when any entity is in RED', async () => {
    m.nitaqatConfig.findMany.mockResolvedValue([{}]);
    m.nitaqatBandSnapshot.findMany.mockResolvedValue([{ band: 'RED', legalEntityId: 'le-1' }]);
    const c = await nitaqatCertificateService.generate('2026-06', auth);
    expect(c.gatingReason).toMatch(/RED-band/);
    expect(c.redCount).toBe(1);
  });

  it('no gating when all entities are GREEN or PLATINUM', async () => {
    m.nitaqatConfig.findMany.mockResolvedValue([{}, {}]);
    m.nitaqatBandSnapshot.findMany.mockResolvedValue([
      { band: 'GREEN', legalEntityId: 'le-1' },
      { band: 'PLATINUM', legalEntityId: 'le-2' },
    ]);
    const c = await nitaqatCertificateService.generate('2026-06', auth);
    expect(c.gatingReason).toBeNull();
  });

  it('sign refuses while gated', async () => {
    m.nitaqatCertificate.findUnique.mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked' });
    await expect(nitaqatCertificateService.sign('2026-06', [], auth)).rejects.toThrow(/gated/);
  });
});

describe('nitaqatHireService', () => {
  it('linkEvidence sets gosi + mudad flags', async () => {
    await nitaqatHireService.linkEvidence('e1', { gosiRegistered: true, mudadCovered: true }, auth);
    expect(m.nitaqatHire.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gosiRegistered: true, mudadCovered: true }),
      })
    );
  });
});
