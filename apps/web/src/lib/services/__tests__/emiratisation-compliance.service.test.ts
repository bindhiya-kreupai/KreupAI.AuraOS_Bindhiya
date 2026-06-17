import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  EMIRATISATION_CONSTANTS,
  emiratisationCertificateService,
  emiratisationConfigService,
  emiratisationFineService,
  emiratisationHireService,
  emiratisationSnapshotService,
} from '../emiratisation-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.emiratisationConfig = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cfg-1', ...create })),
  };
  m.emiratisationTarget = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 't-1', ...create })),
  };
  m.emiratisationSnapshot = {
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 's-1', ...create })),
  };
  m.emiratisationHire = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'h-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'h-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.emiratisationFine = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'f-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'f-1', ...data })),
  };
  m.emiratisationCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
  m.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) => (typeof fn === 'function' ? fn(m) : Promise.all(fn)));
});

describe('constants', () => {
  it('applicability threshold defaults to 50 skilled employees', () => {
    expect(EMIRATISATION_CONSTANTS.APPLICABILITY_THRESHOLD).toBe(50);
  });
  it('default fine per missed hire is AED 7,000', () => {
    expect(EMIRATISATION_CONSTANTS.DEFAULT_FINE_PER_HIRE).toBe(7000);
  });
});

describe('emiratisationConfigService', () => {
  it('isApplicable returns false below threshold', () => {
    expect(emiratisationConfigService.isApplicable(49)).toBe(false);
    expect(emiratisationConfigService.isApplicable(50)).toBe(true);
  });

  it('upsertConfig sets isInScope based on threshold', async () => {
    const row = await emiratisationConfigService.upsertConfig(
      { establishmentName: 'Demo', skilledWorkforceCount: 100 },
      auth
    );
    expect(row.isInScope).toBe(true);
  });

  it('upsertConfig sets isInScope=false when below threshold', async () => {
    const row = await emiratisationConfigService.upsertConfig(
      { establishmentName: 'Demo', skilledWorkforceCount: 30 },
      auth
    );
    expect(row.isInScope).toBe(false);
  });
});

describe('emiratisationHireService.detectFakeRisk', () => {
  it('flags hire with no GPSSA + no WPS as high risk', async () => {
    m.emiratisationHire.findUnique.mockResolvedValue({
      employeeId: 'e1',
      isSkilled: true,
      gpssaRegistered: false,
      wpsCovered: false,
    });
    const updated = await emiratisationHireService.detectFakeRisk('e1', auth);
    expect(updated.fakeRiskScore).toBe(80); // 50 + 30
    expect(updated.fakeRiskFlags).toEqual(['NO_GPSSA', 'NO_WPS']);
  });

  it('hire with both GPSSA + WPS gets zero risk', async () => {
    m.emiratisationHire.findUnique.mockResolvedValue({
      employeeId: 'e2',
      isSkilled: true,
      gpssaRegistered: true,
      wpsCovered: true,
    });
    const updated = await emiratisationHireService.detectFakeRisk('e2', auth);
    expect(updated.fakeRiskScore).toBe(0);
    expect(updated.fakeRiskFlags).toEqual([]);
  });

  it('NOT_SKILLED hire still claimed as headcount adds 20', async () => {
    m.emiratisationHire.findUnique.mockResolvedValue({
      employeeId: 'e3',
      isSkilled: false,
      gpssaRegistered: true,
      wpsCovered: true,
    });
    const updated = await emiratisationHireService.detectFakeRisk('e3', auth);
    expect(updated.fakeRiskScore).toBe(20);
    expect(updated.fakeRiskFlags).toEqual(['NOT_SKILLED_BUT_COUNTED']);
  });

  it('throws when hire record not found', async () => {
    m.emiratisationHire.findUnique.mockResolvedValue(null);
    await expect(emiratisationHireService.detectFakeRisk('x', auth)).rejects.toThrow(/not found/);
  });
});

describe('emiratisationSnapshotService.takeSnapshot', () => {
  it('refuses when entity is below applicability threshold', async () => {
    m.emiratisationConfig.findUnique.mockResolvedValue({
      isInScope: false,
      skilledWorkforceCount: 30,
    });
    await expect(
      emiratisationSnapshotService.takeSnapshot(
        { checkpointDate: new Date('2026-06-30'), checkpoint: 'MID_YEAR', year: 2026 },
        auth
      )
    ).rejects.toThrow(/threshold/);
  });

  it('refuses when target not configured', async () => {
    m.emiratisationConfig.findUnique.mockResolvedValue({
      isInScope: true,
      skilledWorkforceCount: 100,
    });
    m.emiratisationTarget.findUnique.mockResolvedValue(null);
    await expect(
      emiratisationSnapshotService.takeSnapshot(
        { checkpointDate: new Date('2026-06-30'), checkpoint: 'MID_YEAR', year: 2026 },
        auth
      )
    ).rejects.toThrow(/target not configured/);
  });

  it('computes actual rate excluding fake-risk hires; projects fine', async () => {
    m.emiratisationConfig.findUnique.mockResolvedValue({
      isInScope: true,
      skilledWorkforceCount: 100,
    });
    m.emiratisationTarget.findUnique.mockResolvedValue({
      halfYearTargetPct: 2,
      yearEndTargetPct: 4,
      finePerMissedHire: 7000,
    });
    m.emiratisationHire.count.mockResolvedValue(1); // 1 valid UAE national
    const s = await emiratisationSnapshotService.takeSnapshot(
      { checkpointDate: new Date('2026-06-30'), checkpoint: 'MID_YEAR', year: 2026 },
      auth
    );
    expect(s.actualPct).toBe(1); // 1/100 = 1%
    expect(s.targetPct).toBe(2);
    expect(s.gapPct).toBe(1);
    expect(s.missedHires).toBe(1); // ceil(1% of 100)
    expect(s.projectedFine).toBe(7000);
    expect(s.ragStatus).toBe('AMBER'); // gap of 1pp → AMBER per rag() rule
  });

  it('returns GREEN when at or above target', async () => {
    m.emiratisationConfig.findUnique.mockResolvedValue({
      isInScope: true,
      skilledWorkforceCount: 100,
    });
    m.emiratisationTarget.findUnique.mockResolvedValue({
      halfYearTargetPct: 2,
      yearEndTargetPct: 4,
      finePerMissedHire: 7000,
    });
    m.emiratisationHire.count.mockResolvedValue(5); // 5%
    const s = await emiratisationSnapshotService.takeSnapshot(
      { checkpointDate: new Date('2026-06-30'), checkpoint: 'MID_YEAR', year: 2026 },
      auth
    );
    expect(s.ragStatus).toBe('GREEN');
    expect(s.missedHires).toBe(0);
    expect(s.projectedFine).toBe(0);
  });

  it('uses year-end target on YEAR_END checkpoint', async () => {
    m.emiratisationConfig.findUnique.mockResolvedValue({
      isInScope: true,
      skilledWorkforceCount: 100,
    });
    m.emiratisationTarget.findUnique.mockResolvedValue({
      halfYearTargetPct: 2,
      yearEndTargetPct: 4,
      finePerMissedHire: 7000,
    });
    m.emiratisationHire.count.mockResolvedValue(2);
    const s = await emiratisationSnapshotService.takeSnapshot(
      { checkpointDate: new Date('2026-12-31'), checkpoint: 'YEAR_END', year: 2026 },
      auth
    );
    expect(s.targetPct).toBe(4);
    expect(s.gapPct).toBe(2);
    expect(s.missedHires).toBe(2);
    expect(s.projectedFine).toBe(14000);
  });
});

describe('emiratisationFineService.raiseProjected', () => {
  it('copies projected fine from most-recent snapshot', async () => {
    m.emiratisationSnapshot.findFirst.mockResolvedValue({
      missedHires: 3,
      projectedFine: 21000,
    });
    const f = await emiratisationFineService.raiseProjected(
      { year: 2026, checkpoint: 'MID_YEAR' },
      auth
    );
    expect(f.missedHires).toBe(3);
    expect(Number(f.amount)).toBe(21000);
    expect(f.status).toBe('PROJECTED');
  });

  it('throws if no snapshot taken yet', async () => {
    m.emiratisationSnapshot.findFirst.mockResolvedValue(null);
    await expect(
      emiratisationFineService.raiseProjected({ year: 2026, checkpoint: 'MID_YEAR' }, auth)
    ).rejects.toThrow(/snapshot not found/);
  });
});

describe('emiratisationCertificateService', () => {
  it('generate sets gating reason when missed hires > 0', async () => {
    m.emiratisationConfig.findMany.mockResolvedValue([{}]);
    m.emiratisationSnapshot.findMany.mockResolvedValue([
      { ragStatus: 'RED', missedHires: 2, projectedFine: 14000, legalEntityId: 'le-1' },
    ]);
    m.emiratisationHire.count.mockResolvedValue(0);
    const c = await emiratisationCertificateService.generate('2026-06', auth);
    expect(c.gatingReason).toMatch(/missed hire/);
    expect(c.totalMissedHires).toBe(2);
  });

  it('generate sets gating when fake-risk hires > 0', async () => {
    m.emiratisationConfig.findMany.mockResolvedValue([{}]);
    m.emiratisationSnapshot.findMany.mockResolvedValue([]);
    m.emiratisationHire.count.mockResolvedValue(1);
    const c = await emiratisationCertificateService.generate('2026-06', auth);
    expect(c.gatingReason).toMatch(/fake-risk/);
  });

  it('sign refuses while gated', async () => {
    m.emiratisationCertificate.findUnique.mockResolvedValue({
      id: 'c-1',
      gatingReason: 'Blocked: 1 missed hire(s)',
    });
    await expect(emiratisationCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /gated/
    );
  });
});
